import {NextFunction, Request, RequestHandler, Response, RouteParameters} from "express-serve-static-core";
import * as argon2 from "argon2";
import Persistence, {UserData, TherapySession} from "./persistence/Persistence";

export class SessionManager {
    sessionMap: Map<String, Session> = new Map();
    persistence: Persistence;

    constructor(persistence: Persistence) {
        this.persistence = persistence;
    }

    private _middleware = (req: Request, res: Response, next: NextFunction) => {
        let sessionId = req.cookies.sessionId;
        let session = this.sessionMap.get(sessionId);

        if (!sessionId || !session || session.isExpired()) {
            sessionId = this.generateSessionId();
            session = new Session(sessionId);
            this.sessionMap.set(sessionId, session);
            res.cookie('sessionId', sessionId);
        }

        res.locals.session = session;
        next();
    }

    get middleware() {
        return this._middleware.bind(this);
    }

    generateSessionId() {
        let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let sessionId = '';
        for (let i = 0; i < 32; i++) {
            sessionId += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return sessionId;
    }

    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password, {
            type: argon2.argon2id
        });
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await argon2.verify(hash, password);
    }

    async authenticate(session: Session, username: string, password: string): Promise<boolean> {
        let data = await this.persistence.getUserData(username);
        if (!data) return false;
        let success = data.passwordHash !== undefined && await this.verifyPassword(password, data.passwordHash);

        if (success) {
            session.setUserName(username);
            session.setUserData(await this.persistence.getUserData(username));
        }

        return success;
    }

    async deauthenticate(session: Session): Promise<void> {
        session.setUserName(undefined);
        session.setUserData(undefined);
    }

    async createUser(userData: UserData): Promise<void> {
        if (userData.passwordHash === undefined) throw new Error('Password is required');
        userData.passwordHash = await this.hashPassword(userData.passwordHash);
        return await this.persistence.setUserData(userData);
    }

    async updateUser(userData: Partial<UserData>): Promise<void> {
        // linear search, STONK
        this.sessionMap.forEach(session => {
            if (session.getUserName() === userData.username) {
                session.updateUserData(userData);
            }
        });
        return await this.persistence.updateUserData(userData);
    }
}

export class Session {
    private readonly sessionId: string;
    private readonly creationTime: number;
    private username?: string;
    private userData?: UserData;
    private therapySession?: TherapySession;

    constructor(sessionId: string, creationTime?: number) {
        this.sessionId = sessionId;
        this.creationTime = creationTime || Date.now();
    }

    public getSessionId() {
        return this.sessionId;
    }

    public getCreationTime() {
        return this.creationTime;
    }

    public getUserName() {
        return this.username;
    }

    public setUserName(username?: string) {
        this.username = username;
    }

    public getUserData() {
        return this.userData;
    }

    public setUserData(userData?: UserData) {
        this.userData = userData;
    }

    public getTherapySession() {
        return this.therapySession;
    }

    public setTherapySession(therapySession: TherapySession) {
        this.therapySession = therapySession;
    }

    public isExpired() {
        // expire in 30 days
        return (Date.now() - this.creationTime) > 30 * 24 * 60 * 60 * 1000;
    }

    public isAuthenticated() {
        return this.username !== undefined && !this.isExpired();
    }

    public updateUserData(userData: Partial<UserData>) {
        if (this.userData === undefined) return;
        this.userData = {...this.userData, ...userData};
    }
}
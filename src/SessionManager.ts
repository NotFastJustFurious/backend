import {NextFunction, Request, RequestHandler, Response, RouteParameters} from "express-serve-static-core";
import * as argon2 from "argon2";
import Persistence, {UserData} from "./persistence/Persistence";

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

    async updateUser(userData: UserData): Promise<void> {
        return await this.persistence.updateUserData(userData);
    }
}

export class Session {
    private sessionId: string;
    private creationTime: number = Date.now();
    private username?: string;
    private userData?: UserData;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
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
        if (userData === undefined) {
            this.userData = undefined;
        } else {
            this.userData = {...userData, passwordHash: undefined};
        }
    }

    public isExpired() {
        // expire in 30 days
        return (Date.now() - this.creationTime) > 30 * 24 * 60 * 60 * 1000;
    }

    public isAuthenticated() {
        return this.username !== undefined && !this.isExpired();
    }
}
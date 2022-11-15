import Persistence, {TherapySession, UserData, UserIdentifier} from "./persistence/MongoPersistence";
import { SessionManager } from "./SessionManager";
import {Socket} from "socket.io";

export function generateSessionId() {
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sessionId = '';
    for (let i = 0; i < 32; i++) {
        sessionId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return sessionId;
}

export default class TherapyManager {
    sessionMap: Map<UserIdentifier, TherapySession> = new Map();
    playerSocketMap: Map<string, Socket> = new Map();
    persistence: Persistence;
    sessionManager: SessionManager;

    constructor(persistence: Persistence, sessionManager: SessionManager) {
        this.persistence = persistence;
        this.sessionManager = sessionManager;
    }

    async getPatientSession(patient: UserIdentifier): Promise<TherapySession | undefined> {
        let session = this.sessionMap.get(patient);

        if (session === undefined) {
            session = await this.persistence?.getTherapySessionByPatient(patient);
            if (session !== undefined) {
                this.sessionMap.set(patient, session);
            }
        }

        return session;
    }

    async createSession(patient: UserIdentifier, therapist: UserIdentifier) {

        let session: TherapySession = {
            id: generateSessionId(),
            patient,
            therapist,
            active: true
        }

        await this.persistence.closeTherapySession(patient);
        await this.persistence.createTherapySession(session);
        this.sessionMap.set(patient, session);
        return session;
    }

    async allocateTherapist(): Promise<UserData | undefined> {
        let therapistList = await this.persistence.searchTherapist([]);
        let therapist = therapistList.at(therapistList.length * Math.random());
        return therapist;
    }

    setSocket(sessionId: string, username: string, socket: Socket) {
        this.playerSocketMap.set(username, socket);

        socket.on("chat", (message) => {
            console.log("Chat: " + message);

            let session = this.sessionMap.get(username);
            this.sessionMap.forEach((value, key) => {
                if(session === value && key !== username){
                    let socket = this.playerSocketMap.get(key);
                    if(socket){
                        socket.emit("chat", message);
                    }
                }
            });
        });

        socket.on("select", (target, callback) => {
            console.log("select", target)
            if(typeof callback !== "function"){
                callback = (reply: string) => {
                    socket.emit("select", reply);
                }
            } 

            let session = this.sessionManager.getSession(sessionId);
            if(!session || !session.isAuthenticated() || session.getUserData()?.type !== "therapist"){
                callback("FAILED")
                return;
            }

            let targetSession = this.sessionMap.get(target);
            if(!targetSession){
                callback("NO TARGET");
                return;
            }

            this.sessionMap.set(username, targetSession);
            callback("SUCCESS");
        });
    }
}
import Persistence from "./persistence/Persistence";
import { TherapySession } from "./persistence/Persistence";
import { UserData } from "./persistence/Persistence";

export function generateSessionId() {
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sessionId = '';
    for (let i = 0; i < 32; i++) {
        sessionId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return sessionId;
}

export default class TherapyManager {
    sessionMap: Map<string, TherapySession> = new Map();
    persistence: Persistence;

    constructor(persistence: Persistence){
        this.persistence = persistence;
    }

    async getSession(id: string): Promise<TherapySession | undefined>{
        let session = this.sessionMap.get(id);
    
        if(session === undefined){
            session = await this.persistence?.getTherapySessionById(id);
            if(session !== undefined){
                this.sessionMap.set(id, session);
            }
        }

        return session;
    }

    async createSession(patient: string, therapist: string){
        let session: TherapySession = {
            id: generateSessionId(),
            patient,
            therapist,
            active: true,
            messages: []
        }

        await this.persistence.createTherapySession(session);
        return session;
    }

    async allocateTherapist(): Promise<UserData | undefined>{
        throw new Error("Not implemented");
    }

}
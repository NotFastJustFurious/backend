import Persistence, {TherapySession, UserData, UserIdentifier} from "./persistence/MongoPersistence";
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
    persistence: Persistence;

    constructor(persistence: Persistence) {
        this.persistence = persistence;
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
            active: true,
            messages: []
        }

        await this.persistence.closeTherapySession(patient);
        await this.persistence.createTherapySession(session);
        this.sessionMap.set(patient, session);
        return session;
    }

    async sendMessagePatient(patient: UserIdentifier, message: string) {
        let session = await this.getPatientSession(patient);
        ;
        session?.messages.push({
            message,
            author: patient,
            timestamp: Date.now()
        })
        this.persistence.updateTherapySession({
            id: session?.id,
            messages: session?.messages
        })
    }

    async allocateTherapist(): Promise<UserData | undefined> {
        let therapistList = await this.persistence.searchTherapist([]);
        let therapist = therapistList.at(therapistList.length * Math.random());
        return therapist;
    }

    setSocket(username: string, socket: Socket) {

    }
}
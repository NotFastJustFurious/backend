export type UserIdentifier = string;

export type AuthData = {
    username: UserIdentifier,
    passwordHash: string | undefined
}

export type TherapistCredential = {
    name: string,
    description?: string
}

export type UserProfile = {
    firstName: string,
    lastName: string,
    gender: string,
    dob: string,
    condition: string[],
    credentials: TherapistCredential[],
    type: "patient" | "therapist"
}

export type TherapyMessage = {
    author: UserIdentifier,
    timestamp: number,
    message: string
}

export type TherapySession = {
    id: string,
    therapist: UserIdentifier,
    patient: UserIdentifier,
    active: boolean,
    messages: TherapyMessage[]
}

export type TherapyRecord = {
    id: string,
    patient: UserIdentifier,
    date: string,
    note: string
}

export type UserData = AuthData & UserProfile;

export default interface Persistence {

    connect(): Promise<void>;

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined>;

    setUserData(userData: UserData): Promise<void>;

    updateUserData(partialUserData: Partial<UserData>): Promise<void>;

    searchTherapist(condition: string[]): Promise<UserData[]>

    // Records
    
    addRecord(record: TherapyRecord): Promise<void>;

    getRecords(username: UserIdentifier): Promise<TherapyRecord[]>;

    editRecord(record: Partial<TherapyRecord>): Promise<void>;

     // Sessions

    createTherapySession(session: TherapySession): Promise<void>;

    closeTherapySession(session: TherapySession): Promise<void>;

    getTherapySessionByTherapist(therapist: UserIdentifier): Promise<TherapySession[]>;

    getTherapySessionByPatient(patient: UserIdentifier): Promise<TherapySession | undefined>;
    
    getTherapySessionById(id: string): Promise<TherapySession | undefined>;
}
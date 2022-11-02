export type UserIdentifier = string;

export type AuthData = {
    username: UserIdentifier;
    passwordHash: string | undefined;
}

export type TherapistCredential = {
    name: string,
    description?: string
}

export type UserProfile = {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    condition: string[];
    credentials: TherapistCredential[];
    type: "patient" | "therapist";
}

export type PatientRecord = {
    username: UserIdentifier,
    date: string,
    note: string
}

export type Session = {
    therapist: UserIdentifier,
    patient: UserIdentifier
}

export type UserData = AuthData & UserProfile;

export default interface Persistence {

    connect(): Promise<void>;

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined>;

    setUserData(userData: UserData): Promise<void>;

    updateUserData(partialUserData: Partial<UserData>): Promise<void>;

    searchTherapist(condition: string[]): Promise<UserProfile[]>

    // Records
    
    addRecord(record: PatientRecord): Promise<void>;

    getRecords(username: UserIdentifier): Promise<PatientRecord[]>;

    editRecord(record: PatientRecord): Promise<void>;

    // Requests

    // listRequest(therapist: UserIdentifier): Promise



    // Sessions


}
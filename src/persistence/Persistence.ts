export type UserIdentifier = string;

export type AuthData = {
    username: string;
    passwordHash: string | undefined;
}

export type UserProfile = {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    condition: string[];
    type: "patient" | "therapist";
}

export type UserData = AuthData & UserProfile;

export default interface Persistence {

    connect(): Promise<void>;

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined>;

    setUserData(userData: UserData): Promise<void>;

    updateUserData(userData: UserData): Promise<void>;

    getTherapist(condition: string[]): Promise<UserProfile[]>
}
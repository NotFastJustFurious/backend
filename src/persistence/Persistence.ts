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
    type: string;
}

export type UserData = AuthData & UserProfile;

export default interface Persistence {
    getAuthData(identifier: UserIdentifier): Promise<AuthData | undefined>;

    setAuthData(authData: AuthData): Promise<void>;

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined>;

    setUserData(userData: UserData): Promise<void>;
}
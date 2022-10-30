export type UserIdentifier = string;

export type AuthData = {
    username: string;
    passwordHash: string | undefined;
}

export type UserData = AuthData;

export default interface Persistence {
    getAuthData(identifier: UserIdentifier): Promise<AuthData | null>;

    setAuthData(authData: AuthData): Promise<void>;
}
import Persistence, {AuthData, UserData, UserIdentifier} from "./Persistence";

export class PlainTextPersistence implements Persistence {
    data: object = {};

    async getAuthData(identifier: UserIdentifier): Promise<AuthData | null> {
        //@ts-ignore
        return this.data[identifier] || null;
    }

    async setAuthData(authData: AuthData): Promise<void> {
        //@ts-ignore
        this.data[authData.username] = authData || {};
    }

}
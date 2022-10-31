import Persistence, {AuthData, UserData, UserIdentifier} from "./Persistence";

export class PlainTextPersistence implements Persistence {

    data: object = {};

     getAuthData(identifier: UserIdentifier): Promise<AuthData | undefined> {
        return this.getUserData(identifier);    
    }

    async setAuthData(authData: AuthData): Promise<void> {
        //@ts-ignore
        this.data[authData.username] = {...this.data[authData.username] , ...authData};
    }

    async getUserData(identifier: string): Promise<UserData | undefined> {
        //@ts-ignore
        return this.data[identifier] || undefined;
    }

    async setUserData(userData: UserData): Promise<void> {
        //@ts-ignore
        this.data[userData.username] = userData;
    }

    updateUserData(userData: UserData): Promise<void> {
        return this.setUserData(userData);
    }
}
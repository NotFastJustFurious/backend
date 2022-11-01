import Persistence, {AuthData, UserData, UserProfile, UserIdentifier} from "./Persistence";

export default class PlainTextPersistence implements Persistence {

    data: object = {};

    async connect(): Promise<void>{

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
    
    getTherapist(condition: string): Promise<UserProfile[]>{
        throw new Error("Not implemented");
    }
}
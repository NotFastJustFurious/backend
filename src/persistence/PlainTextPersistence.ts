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

    async updateUserData(partialUserData: Partial<UserData>): Promise<void>{
        let username = partialUserData.username;
        //@ts-ignore
        this.data[username] = {...this.data[username], ...partialUserData};
    }
    

    async getTherapist(condition: string[]): Promise<UserProfile[]>{
        let profile :UserProfile =  {
            firstName: "John",
            lastName: "Doe",
            gender: "Moo",
            dob: "1999-01-01",
            condition: ["depression"],
            type: "therapist"
        };
        return [
           profile
        ];
    }
}
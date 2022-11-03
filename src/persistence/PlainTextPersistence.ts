import Persistence, {AuthData, UserData, TherapyRecord, UserProfile, UserIdentifier, TherapySession} from "./Persistence";

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
    

    async searchTherapist(condition: string[]): Promise<UserProfile[]>{
        let profile :UserProfile =  {
            firstName: "John",
            lastName: "Doe",
            gender: "Moo",
            dob: "1999-01-01",
            condition: [],
            credentials: [{
                name: "depression",
                description: "they can solve the big sad!"
            }],
            type: "therapist"
        };
        return [
           profile
        ];
    }

    addRecord(record: TherapyRecord): Promise<void>{
        throw new Error("Not implemented");
    }

    async getRecords(username: UserIdentifier): Promise<TherapyRecord[]>{
        return [
            {
                username: "hello",
                date: "03/06/2009",
                note: "help! she's crazy!!! This is an emerge   "
            }
        ];
    }

    editRecord(record: TherapyRecord): Promise<void> {
        throw new Error("Not implemented");
    }



    createTherapySession(session: TherapySession): Promise<void>{
        throw new Error("Not implemented");
    }

    closeTherapySession(session: TherapySession): Promise<void>{
        throw new Error("Not implemented");
    }

    getTherapySession(record: UserIdentifier): Promise<TherapySession[]> {
        throw new Error("Not implemented");
    }
}
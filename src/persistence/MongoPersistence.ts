import { MongoClient, Db, Collection} from 'mongodb';

import Persistence, {UserData, UserProfile, PatientRecord, UserIdentifier} from './Persistence';

export default class MongoPersistence implements Persistence{
    mongo: MongoClient;
    database?: Db;
    accounts?: Collection<UserData>;

    constructor(uri: string){
        this.mongo = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        await this.mongo.connect();
        this.database = this.mongo.db("karmental");
        this.accounts = this.database.collection<UserData>("account");
    }

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined>{
        return this.accounts?.findOne<UserData>({
            username: identifier
         }).then(userData => {
            return userData ? userData : undefined;
         }) as Promise<UserData | undefined>;
    }

    async setUserData(userData: UserData): Promise<void>{
        await this.accounts?.insertOne(userData);
    }

    async updateUserData(partialUserData: Partial<UserData>): Promise<void>{
        await this.accounts?.updateOne({
            username: partialUserData.username
        },{
            $set: partialUserData
        });
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

    addRecord(record: PatientRecord): Promise<void>{
        throw new Error("Not implemented");
    }

    getRecords(username: UserIdentifier): Promise<PatientRecord[]>{
        throw new Error("Not implemented");
    }

    editRecord(record: PatientRecord): Promise<void> {
        throw new Error("Not implemented");
    }
}
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

import Persistence, { UserData, UserProfile, TherapyRecord, UserIdentifier, TherapySession } from './Persistence';

export default class MongoPersistence implements Persistence {
    mongo: MongoClient;
    database?: Db;

    accountCollection?: Collection<UserData>;
    therapyCollection?: Collection<TherapySession>;
    recordCollection?: Collection<TherapyRecord>;

    constructor(uri: string) {
        this.mongo = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        await this.mongo.connect();
        this.database = this.mongo.db("karmental");
        this.accountCollection = this.database.collection<UserData>("account");
        this.therapyCollection = this.database.collection<TherapySession>("therapy");
        this.recordCollection = this.database.collection<TherapyRecord>("record");
    }

    getUserData(identifier: UserIdentifier): Promise<UserData | undefined> {
        return this.accountCollection?.findOne<UserData>({
            username: identifier
        }).then(userData => {
            return userData ? userData : undefined;
        }) as Promise<UserData | undefined>;
    }

    async setUserData(userData: UserData): Promise<void> {
        await this.accountCollection?.insertOne(userData);
    }

    async updateUserData(partialUserData: Partial<UserData>): Promise<void> {
        await this.accountCollection?.updateOne({
            username: partialUserData.username
        }, {
            $set: partialUserData
        });
    }

    async searchTherapist(condition: string[]): Promise<UserProfile[]> {
        let profile: UserProfile = {
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

    async addRecord(record: TherapyRecord): Promise<void> {
        await this.recordCollection?.insertOne(record);
    }

    async getRecords(username: UserIdentifier): Promise<TherapyRecord[]> {
        return await this.recordCollection?.find({
            username: username
        }).toArray() as TherapyRecord[];
    }

    async editRecord(record: TherapyRecord): Promise<void> {
        var newData: Partial<TherapyRecord> = { ...record };
        delete newData.id;
        if(!newData.patient) delete newData.patient;
        if(!newData.date) delete newData.date;
        if(!newData.note) delete newData.note;

        await this.recordCollection?.updateOne({
            id: record.id
        }, {
            $set: newData
        });
    }

    createTherapySession(session: TherapySession): Promise<void> {
        throw new Error("Not implemented");
    }

    closeTherapySession(session: TherapySession): Promise<void> {
        throw new Error("Not implemented");
    }

    async getTherapySessionByTherapist(therapist: UserIdentifier): Promise<TherapySession[]> {
        return await this.therapyCollection?.find({
            therapist: therapist
        }).toArray() as TherapySession[];
    }

    async getTherapySessionByPatient(patient: UserIdentifier): Promise<TherapySession> {
        return await this.therapyCollection?.findOne({
            patient: patient
        }) as TherapySession;
    }

    getTherapySessionById(id: string): Promise<TherapySession | undefined>{
        throw new Error("Not implemented");
    }
}
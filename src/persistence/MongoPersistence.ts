import {MongoClient, Db, Collection, ObjectId} from 'mongodb';

export type UserIdentifier = string;

export type AuthData = {
    username: UserIdentifier,
    passwordHash: string | undefined
}

export type TherapistCredential = {
    name: string,
    description?: string
}

export type UserProfile = {
    firstName: string,
    lastName: string,
    gender: string,
    dob: string,
    condition: string[],
    credentials: TherapistCredential[],
    type: "patient" | "therapist"
}

export type TherapyMessage = {
    author: UserIdentifier,
    timestamp: number,
    message: string
}

export type TherapySession = {
    id: string,
    therapist: UserIdentifier,
    patient: UserIdentifier,
    active: boolean
}

export type TherapyRecord = {
    id: string,
    therapist: UserIdentifier,
    patient: UserIdentifier,
    condition: string,
    rate: number,
    date: number,
    note: string
}

export type UserData = AuthData & UserProfile;

export default class MongoPersistence {
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

    async searchTherapist(condition: string[]): Promise<UserData[]> {
        return await this.accountCollection?.find({
            type: "therapist"
        }).toArray() as UserData[];
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
        var newData: Partial<TherapyRecord> = {...record};
        delete newData.id;
        if (!newData.patient) delete newData.patient;
        if (!newData.date) delete newData.date;
        if (!newData.note) delete newData.note;

        await this.recordCollection?.updateOne({
            id: record.id
        }, {
            $set: newData
        });
    }

    async createTherapySession(session: TherapySession): Promise<void> {
        await this.therapyCollection?.insertOne({...session});
    }

    async closeTherapySession(patient: UserIdentifier): Promise<void> {
        await this.therapyCollection?.updateMany({
            patient
        }, {
            $set: {
                active: false
            }
        });
    }

    async getTherapySessionByTherapist(therapist: UserIdentifier): Promise<TherapySession[]> {
        return await this.therapyCollection?.find({
            therapist: therapist,
            active: true
        }).toArray() as TherapySession[];
    }

    async getTherapySessionByPatient(patient: UserIdentifier): Promise<TherapySession | undefined> {
        let result = await this.therapyCollection?.findOne({
            patient: patient,
            active: true
        });

        if (result === null) result = undefined;

        return result;
    }

    getTherapySessionById(id: string): Promise<TherapySession | undefined> {
        throw new Error("Not implemented");
    }

    async updateTherapySession(session: Partial<TherapySession>): Promise<void> {
        await this.therapyCollection?.updateOne({
            id: session.id
        }, {
            $set: session
        })
    }
}
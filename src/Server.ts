import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Dotenv from 'dotenv';
import Express, { Application } from 'express';

import CorsMiddleware from './CorsMiddleware';
import Persistence from './persistence/Persistence';
import PlainTextPersistence from './persistence/PlainTextPersistence';
import MongoPersistence from './persistence/MongoPersistence';
import { SessionManager } from "./SessionManager";

import { Route } from './route/Route';
import RouteTest from './route/RouteTest';
import { RouteLogin, RouteLogout, RouteRegister } from './route/RouteAuthentication';
import { RouteProfile, RouteProfileEdit } from './route/RouteProfile';
import { RouteTherapist, RouteTherapyGet, RouteTherapySendMessagePatient, RouteTherapyCreate } from './route/RouteTherapy';
import { RouteRecordAdd, RouteRecordEdit } from './route/RouteRecord';

import TherapyManager from './TherapyManager';


export class Server {
    port: number = 3000;
    path: string = "";
    routes: Route[] = [];
    express?: Express.Application;
    persistence?: Persistence;
    sessionManager?: SessionManager;
    therapyManager?: TherapyManager;

    relativePath(relative: string): string {
        if (relative.startsWith("/")) relative = relative.substring(1);
        return this.path + relative;
    }

    setupRoutes() {
        if(this.express === undefined) throw new Error("What?!");

        this.routes.push(new RouteTest());

        this.routes.push(new RouteLogin());
        this.routes.push(new RouteLogout());
        this.routes.push(new RouteRegister());

        this.routes.push(new RouteProfile());
        this.routes.push(new RouteProfileEdit());

        this.routes.push(new RouteTherapist());
        this.routes.push(new RouteTherapyGet());
        this.routes.push(new RouteTherapyCreate());
        this.routes.push(new RouteTherapySendMessagePatient());

        this.routes.push(new RouteRecordAdd());
        this.routes.push(new RouteRecordEdit());

        this.routes.forEach(route => {
            route.setup(this.express as Application, this);
        });
    }

    public async start() {

        Dotenv.config();
        if (process.env.PORT != undefined)
            this.port = Number.parseInt(process.env.PORT);
        if (process.env.BASE != undefined)
            this.path = process.env.BASE;

        if (process.env.MONGODB === undefined) {
            console.log("Using fallback persistence");
            this.persistence = new PlainTextPersistence();
        }
        else {
            console.log("Using MongoDB persistence");
            this.persistence = new MongoPersistence(process.env.MONGODB);
        }
        await this.persistence.connect();

        this.sessionManager = new SessionManager(this.persistence);
        this.therapyManager = new TherapyManager(this.persistence);

        this.express = Express()
        this.express.use(CorsMiddleware);
        this.express.use(BodyParser.json());
        this.express.use(CookieParser());
        this.express.use(this.sessionManager.middleware);

        this.setupRoutes();

        this.express.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

new Server().start();


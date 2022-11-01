import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Dotenv from 'dotenv';
import Express from 'express';

import CorsMiddleware from './CorsMiddleware';
import Persistence from './persistence/Persistence';
import PlainTextPersistence from './persistence/PlainTextPersistence';
import MongoPersistence from './persistence/MongoPersistence';
import { SessionManager } from "./SessionManager";

import { Route } from './route/Route';
import RouteTest from './route/RouteTest';
import { RouteAuthentication, RouteLogout } from './route/RouteAuthentication';
import { RouteProfile, RouteRegister, RouteProfileEdit } from './route/RouteProfile';



export class Server {
    port: number = 3000;
    path: string = "";
    express: Express.Application;
    routes: Route[] = [];
    persistence: Persistence;
    sessionManager: SessionManager;

    constructor() {
        Dotenv.config();
        if(process.env.PORT != undefined)
            this.port = Number.parseInt(process.env.PORT);
        if(process.env.BASE != undefined)
            this.path = process.env.BASE;

        if(process.env.MONGODB === undefined){
            console.log("Using fallback persistence");
            this.persistence = new PlainTextPersistence();
        }
        else{
            console.log("Using MongoDB persistence");
            this.persistence = new MongoPersistence(process.env.MONGODB);
        }
        this.persistence.connect();
        
        this.sessionManager = new SessionManager(this.persistence);
        
        this.sessionManager.createUser({
            username: "hello",
            passwordHash: "hi",
            firstName: 'Opal',
            lastName: 'a',
            gender: 'a',
            dob: 'a',
            condition: [],
            type: 'patient'
        })

        this.express = Express()
        this.express.use(CorsMiddleware);
        this.express.use(BodyParser.json());
        this.express.use(CookieParser());
        this.express.use(this.sessionManager.middleware);

        this.setupRoutes();
    }

    relativePath(relative: string): string {
        if(relative.startsWith("/")) relative = relative.substring(1);
        return this.path + relative;
    }

    setupRoutes() {
        this.routes.push(new RouteTest());
        this.routes.push(new RouteAuthentication());
        this.routes.push(new RouteLogout());
        this.routes.push(new RouteProfile());
        this.routes.push(new RouteRegister());
        this.routes.push(new RouteProfileEdit());

        this.routes.forEach(route => {
            route.setup(this.express, this);
        });
    }

    public start() {
        this.express.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

new Server().start();
import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Dotenv from 'dotenv';

import { SessionManager } from "./SessionManager";
import CorsMiddleware from './CorsMiddleware';
import Persistence from './persistence/Persistence';
import { PlainTextPersistence } from './persistence/PlainTextPersistence';

import { Route } from './route/Route';
import RouteTest from './route/RouteTest';
import TestAuth from './route/RouteAuthentication';


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

        this.persistence = new PlainTextPersistence();
        this.sessionManager = new SessionManager(this.persistence);

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
        this.routes.push(new TestAuth());

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
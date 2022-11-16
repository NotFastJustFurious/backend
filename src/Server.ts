import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Dotenv from 'dotenv';
import Express, {Application} from 'express';
import * as http from "http";

import CorsMiddleware from './CorsMiddleware';
import MongoPersistence from './persistence/MongoPersistence';
import {SessionManager} from "./SessionManager";

import {Route} from './route/Route';
import RouteTest from './route/RouteTest';
import {RouteLogin, RouteLogout, RouteRegister} from './route/RouteAuthentication';
import {RouteProfile, RouteProfileEdit} from './route/RouteProfile';
import {
    RouteTherapist,
    RouteTherapyGet,
    RouteTherapyCreate
} from './route/RouteTherapy';
import {RouteRecordAdd, RouteRecordEdit, RouteRecordGet} from './route/RouteRecord';
import {RouteSurveyResponseAdd} from './route/RouteSurvey';
import {Server as SocketServer} from "socket.io";

import TherapyManager from './TherapyManager';


export class Server {
    port: number = 3000;
    socketPort: number = 3002;
    path: string = "";
    routes: Route[] = [];
    express?: Express.Application;
    persistence?: MongoPersistence;
    sessionManager?: SessionManager;
    therapyManager?: TherapyManager;
    socketHttpServer?: http.Server;
    socketServer?: SocketServer;

    relativePath(relative: string): string {
        if (relative.startsWith("/")) relative = relative.substring(1);
        return this.path + relative;
    }

    setupRoutes() {
        if (this.express === undefined) throw new Error("What?!");

        this.routes.push(new RouteTest());

        this.routes.push(new RouteLogin());
        this.routes.push(new RouteLogout());
        this.routes.push(new RouteRegister());

        this.routes.push(new RouteProfile());
        this.routes.push(new RouteProfileEdit());

        this.routes.push(new RouteTherapist());
        this.routes.push(new RouteTherapyGet());
        this.routes.push(new RouteTherapyCreate());

        this.routes.push(new RouteRecordAdd());
        this.routes.push(new RouteRecordGet());
        this.routes.push(new RouteRecordEdit());

        this.routes.push(new RouteSurveyResponseAdd());

        this.routes.forEach(route => {
            route.setup(this.express as Application, this);
        });
    }

    setupSockets() {
        this.socketServer?.on("connection", (socket) => {
            console.log("Socket connected");

            socket.on("auth", (sessionId, callback) => {
                if(typeof callback !== "function"){
                    callback = (payload: any) => {
                        socket.emit("auth", payload);
                    }
                }

                let session = this.sessionManager?.getSession(sessionId);
                if(!session || !session.isAuthenticated) {
                    callback("FAILED");
                    return;
                }

                this.sessionManager?.setSocket(sessionId, socket);
                this.therapyManager?.setSocket(sessionId, session.getUserName() as string, socket);
                callback("OK");
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
            });
        });
    }

    public async start() {

        Dotenv.config();

        if(!process.env.MONGODB) throw new Error("No mongo url specified");

        if (process.env.PORT != undefined) {
            this.port = Number.parseInt(process.env.PORT);
            this.socketPort = this.port + 1;
        }

        if (process.env.BASE != undefined)
            this.path = process.env.BASE;

        this.persistence = new MongoPersistence(process.env.MONGODB as string);
        await this.persistence.connect();

        this.sessionManager = new SessionManager(this.persistence);
        this.therapyManager = new TherapyManager(this.persistence, this.sessionManager);


        this.express = Express()
        this.express.use(CorsMiddleware);
        this.express.use(BodyParser.json());
        this.express.use(CookieParser());
        this.express.use(this.sessionManager.middleware);
        this.setupRoutes();

        this.socketServer = new SocketServer();
        this.setupSockets();
        this.socketServer.listen(this.socketPort, {
                cors: {
                    allowedHeaders: "*"
                }
            }
        );


        console.log(`Socket server listening on port ${this.socketPort}`);


        this.express.listen(this.port, () => {
            console.log(`Backend server listening on port ${this.port}`);
        });
    }
}

new Server().start();


import { Route } from "./Route";
import { Application } from "express";
import { Session } from "../SessionManager";
import { Server } from "../Server";

export class RouteChatGet extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("chat"), (req, res) => {
            let session : Session = res.locals.session; 

        });
    }
}
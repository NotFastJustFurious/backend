import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";

export default class TestAuth implements Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("login"), (req, res) => {
            let session = res.locals.session;
            let username = req.body.username;
            let password = req.body.password;

            console.log(session, req.body, username, password);
            server.sessionManager.authenticate(session, username, password).then(success => {
                
            }).catch(err => {
            
            });
        });
    }
}
import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";

export class RouteAuthentication extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("login"), (req, res) => {
            let session = res.locals.session;
            let username = req.body.username;
            let password = req.body.password;

            if (session.isAuthenticated()) {
                res.send(this.serialize({
                    success: true
                }));

                return;
            }

            // console.log(session, req.body, username, password);
            server.sessionManager.authenticate(session, username, password).then(success => {
                res.send(this.serialize({
                    success: success,
                    error: success ? undefined : "Invalid username or password"
                }))

            }).catch(err => {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Bad request"
                }));
            });
        });
    }
}

export class RouteLogout extends Route{
    setup(express: Application, server: Server): void {
        express.delete(server.relativePath("login"), async (req, res) => {
            let session: Session = res.locals.session;
            await server.sessionManager.deauthenticate(session);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}
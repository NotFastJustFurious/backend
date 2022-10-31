import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";

export class RouteProfile extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("profile"), async (req, res) => {
            let session: Session = res.locals.session;
            let username = session.getUserName();
            if (username != undefined) {
                let data = await server.persistence.getUserData(username)
                res.send(this.serialize({
                    success: true,
                    data: data
                }));
                return;
            }
            else {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not login"
                }));
            }
        });
    }
}
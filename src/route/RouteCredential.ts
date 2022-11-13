import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { UserData } from "../persistence/MongoPersistence";

export class RouteCredentialEdit extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("credential"), async (req, res) => {
            let session: Session = res.locals.session;
            let data = session.getUserData()
            if (data != undefined) {
                data.credentials = req.body.credentials;

                await server.sessionManager?.updateUser(data);
                res.send(this.serialize({
                    success: true
                }));
            }
            else {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not Authenticated"
                }));
            }
        });
    }
}

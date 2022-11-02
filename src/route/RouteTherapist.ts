import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { UserData } from "../persistence/Persistence";

export class RouteTherapist extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("therapist"), async (req, res) => {
            let session: Session = res.locals.session;

            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not login"
                }));
                return;
            }

            let condition = session.getUserData()?.condition;
            let therapist = await server.persistence?.getTherapist(condition ? condition : []);

            res.send(this.serialize({
                success: true,
                data: therapist
            }));
        });
    }
}

import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { TherapySession } from "../persistence/Persistence";

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
            let therapist = await server.persistence?.searchTherapist(condition ? condition : []);

            res.send(this.serialize({
                success: true,
                data: therapist
            }));
        });
    }
}
// TODO: validate patient data


// createTherapySession(session: TherapySession): Promise<void>;
export class RouteTherapistCreate extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("therapy/create"), async (req, res) => {
            let session: Session = res.locals.session;
            if (session.getUserData()?.type !== "therapist") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data: TherapySession = {
                id: req.body.id,
                therapist: session.getUserData()?.username as string,
                patient: req.body.patient,
                active: true,
                messages: req.body.messages,
            }

            await server.persistence?.createTherapySession(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}

// closeTherapySession(session: TherapySession): Promise<void>;
export class RouteTherapistClose extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("therapy/close"), async (req, res) => {
            let session: Session = res.locals.session;
            let data = session.getTherapySession();
            if (session.getUserData()?.type !== "therapist") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            if (data != undefined) {
                data.active = false
            }

            await server.persistence?.closeTherapySession(data? data as TherapySession : {} as TherapySession);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}

export class RouteTherapistSessionList extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("therapy/list"), async (req, res) => {
            let session: Session = res.locals.session;

            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not login"
                }));
                return;
            }

            let therapist = session.getUserData()?.username;
            let therapistsession = await server.persistence?.getTherapySession(therapist ? therapist : "");
            res.send(this.serialize({
                success: true,
                data: therapistsession
            }));
        });
    }
}



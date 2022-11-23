import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { TherapySession } from "../persistence/MongoPersistence";
import Randomizer from "../util/Randomizer";

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
export class RouteTherapyCreate extends Route {

    setup(express: Application, server: Server): void {
        express.post(server.relativePath("therapy/create"), async (req, res) => {
            let session: Session = res.locals.session;

            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not authenticated"
                }))
                return;
            }

            let therapist = await server.therapyManager?.allocateTherapist();
            if (therapist === undefined) {
                throw new Error("Illegal state!");
            }

            let therapySession = await server.therapyManager?.createSession(session.getUserName() as string, therapist.username);

            res.send(this.serialize({
                success: true,
                data: therapySession
            }));
        });
    }
}

export class RouteTherapyGet extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("therapy"), async (req, res) => {
            let session: Session = res.locals.session;
            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not authenticated"
                }));
                return;
            }

            let therapySession = await server.therapyManager?.getPatientSession(session.getUserName() as string);

            res.send(this.serialize({
                success: true,
                data: therapySession
            }));
        });
    }
}

// closeTherapySession(session: TherapySession): Promise<void>;
export class RouteTherapyClose extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("therapy/close"), async (req, res) => {
            let session: Session = res.locals.session;
            let target: string | undefined = session.getUserName();

            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Not authenticated"
                }));
                return;
            }

            if (req.body.patient != null && req.body.patient != undefined) {
                if (session.getUserData()?.type === "therapist") {
                    target = req.body.patient as string;
                }
                else {
                    res.status(401).send(this.serialize({
                        success: false,
                        error: "Therapist account needed to close other's therapy session"
                    }));
                    return;
                }
            }


            console.log("patient", req.body, target);
            server.therapyManager?.closeSession(target as string);
            await server.persistence?.closeTherapySession(target as string );
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

            if (session.getUserData()?.type !== "therapist") {
                res.status(403).send(this.serialize({
                    success: false,
                    error: "Not therapist"
                }));
                return;
            }

            let therapist = session.getUserData()?.username;
            let therapistsession = await server.persistence?.getTherapySessionByTherapist(therapist as string);
            res.send(this.serialize({
                success: true,
                data: therapistsession
            }));
        });
    }
}



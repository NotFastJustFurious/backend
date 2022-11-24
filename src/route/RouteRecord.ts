import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { TherapyRecord } from "../persistence/MongoPersistence";


function generateId() {
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sessionId = '';
    for (let i = 0; i < 16; i++) {
        sessionId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return sessionId;
}

export class RouteRecordAdd extends Route {

    validate(data: string | undefined): boolean {
        let success = data != undefined && data != "";
        return success;
    }

    setup(express: Application, server: Server): void {
        express.post(server.relativePath("record/add"), async (req, res) => {
            let session: Session = res.locals.session;
            if (session.getUserData()?.type !== "therapist") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data: TherapyRecord = {
                id: generateId(),
                therapist: session.getUserName() as string,
                patient: req.body.patient,
                condition: req.body.condition,
                rate: req.body.rate,
                date: Date.now(),
                note: req.body.note
            }
            
            await server.persistence?.addRecord(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}

export class RouteRecordGet extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("record"), async (req, res) => {
            let session: Session = res.locals.session;
            if (session.getUserData()?.type !== "therapist") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data = await server.persistence?.getRecords(session.getUserName() as string);
            res.send(this.serialize({
                success: true,
                data: data
            }));

        });
    }
}

export class RouteRecordGetSelf extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("record/self"), async (req, res) => {
            let session: Session = res.locals.session;
            if (!session.isAuthenticated()) {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }
            
            let data = await server.persistence?.getRecordsSelf(session.getUserName() as string);
            res.send(this.serialize({
                success: true,
                data: data
            }));
            
        });
    }
}

export class RouteRecordEdit extends Route {

    setup(express: Application, server: Server): void {
        express.patch(server.relativePath("record/edit"), async (req, res) => {
            let session: Session = res.locals.session;
            if (session.getUserData()?.type !== "therapist") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            await server.persistence?.editRecord({
                id: req.body.id,
                therapist: req.body.therapist,
                patient: req.body.patient,
                condition: req.body.condition,
                rate: req.body.rate,
                date: req.body.date,
                note: req.body.note
            });

            res.send(this.serialize({
                success: true
            }));
        });
    }
}


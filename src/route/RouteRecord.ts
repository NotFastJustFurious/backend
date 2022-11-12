import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { TherapyRecord } from "../persistence/Persistence";


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
        express.get(server.relativePath("record/add"), async (req, res) => {
            let session: Session = res.locals.session;
            if(session.getUserData()?.type !== "therapist"){
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data: TherapyRecord = {
                id: generateId(),
                patient: req.body.patient,
                date: req.body.date,
                note: req.body.note
            }

            let inputValid = this.validate(data.patient);
            inputValid &&= this.validate(data.date);
            inputValid &&= this.validate(data.patient);

            if (!inputValid) {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Invalid input"
                }));
                return;
            }

            await server.persistence?.addRecord(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}
export class RouteRecordEdit extends Route {

    setup(express: Application, server: Server): void {
        express.patch(server.relativePath("record/edit"), async (req, res) => {
            let session: Session = res.locals.session;
            if(session.getUserData()?.type !== "therapist"){
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            await server.persistence?.editRecord({
                id: req.body.id,
                patient: req.body.patient,
                date: req.body.date,
                note: req.body.note
            });

            res.send(this.serialize({
                success: true
            }));
        });
    }
}


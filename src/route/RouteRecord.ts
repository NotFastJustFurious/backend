import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { PatientRecord } from "../persistence/Persistence";

export class RouteRecordAdd extends Route {
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

            let data: PatientRecord = {
                username: req.body.username,
                date: req.body.date,
                note: req.body.note,
            }
            await server.persistence?.addRecord(data);
            res.send(this.serialize({
                success: true
            }));
            // res.status(401).send(this.serialize({
            //     success: false,
            //     error: "Not add"
            // }));
        });
    }
}

export class RouteRecordEdit extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("record/edit"), async (req, res) => {
            let session: Session = res.locals.session;
            if(session.getUserData()?.type !== "therapist"){
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data: PatientRecord = {
                username: req.body.username,
                date: req.body.date,
                note: req.body.note,
            }
            await server.persistence?.editRecord(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}


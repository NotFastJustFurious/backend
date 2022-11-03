import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { TherapyRecord } from "../persistence/Persistence";

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

            let data: TherapyRecord = {
                patient: req.body.username,
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
//TODO check if edit record not "" and ถ้าไม่กรอกมาใช้อันเก่า
export class RouteRecordEdit extends Route {

    validate(data: string | undefined): boolean {
        let success = data != undefined && data != "";
        return success;
    }

    setup(express: Application, server: Server): void {
        express.get(server.relativePath("record/edit"), async (req, res) => {
            let session: Session = res.locals.session;
            let data: TherapyRecord = await server.persistence?.getRecords(session.getUserData()?.username as string) as TherapyRecord;
            if(session.getUserData()?.type !== "therapist"){
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }
            
            if (data != undefined) {
                data.patient =  req.body.username;
                data.date = req.body.date;
                data.note = req.body.note;
            }
    
            let inputValid = this.validate(data.patient);
            inputValid &&= this.validate(data.date);
            inputValid &&= this.validate(data.note);

            if(!inputValid) {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Invalid input"
                }));
                return;
            }

            await server.persistence?.editRecord(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}


import { Route } from "./Route";
import { Application } from "express";
import { Session } from "../SessionManager";
import { Server } from "../Server";
import { SurveyResponse } from "../persistence/MongoPersistence";

export class RouteSurveyResponseAdd extends Route {

    validate(data: undefined | null | number): boolean {
        let success = data !== undefined && data != null && typeof data === "number";
        return success;
    }

    setup(express: Application, server: Server): void {
        express.post(server.relativePath("survey/add"), async (req, res) => {
            let session: Session = res.locals.session;
            let patient = session.getUserName() as string;
            if (session.getUserData()?.type !== "patient") {
                res.status(401).send(this.serialize({
                    success: false,
                    error: "Access denied"
                }));
                return;
            }

            let data: SurveyResponse = {
                patient: patient,
                response: {
                    anx: req.body.anx,
                    dep: req.body.dep,
                    ptsd: req.body.ptsd,
                    ocd: req.body.ocd,
                    ed: req.body.ed
                }
            }

            let inputValid = this.validate(data.response.anx);
            inputValid &&= this.validate(data.response.dep);
            inputValid &&= this.validate(data.response.ptsd);
            inputValid &&= this.validate(data.response.ocd);
            inputValid &&= this.validate(data.response.ed);


            if (!inputValid) {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Invalid input"
                }));
                return;
            }

            await server.persistence?.addSurveyRecord(data);
            res.send(this.serialize({
                success: true

            }));
        });
    }
}
import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";
import { Session } from "../SessionManager";
import { UserData } from "../persistence/Persistence";

export class RouteProfile extends Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("profile"), async (req, res) => {
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

export class RouteRegister extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("register"), async (req, res) => {
            let session: Session = res.locals.session;
            let data: UserData = {
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                passwordHash: req.body.password,
                gender: req.body.gender,
                dob: req.body.dob,
                type: "patient"
            }
            //TODO validate data
            await server.sessionManager.createUser(data);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}

export class RouteProfileEdit extends Route {
    setup(express: Application, server: Server): void {
        express.patch(server.relativePath("profile"), async (req, res) => {
            let session: Session = res.locals.session;
            let data = session.getUserData()
            if (data != undefined) {
                data.firstName = req.body.firstName;
                data.lastName = req.body.lastName;
                data.dob = req.body.dob;

                let password = req.body.password;
                let passwordHash = await server.sessionManager.hashPassword(password)
                data.passwordHash = passwordHash;
                //TODO validate data
                await server.sessionManager.updateUser(data);
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
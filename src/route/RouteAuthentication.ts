import {Application} from "express";
import {Server} from "../Server";
import {Route} from "./Route";
import {Session} from "../SessionManager";
import {UserData} from "../persistence/MongoPersistence";

export class RouteLogin extends Route {
    setup(express: Application, server: Server): void {
        express.post(server.relativePath("login"), (req, res) => {
            let session = res.locals.session;
            let username = req.body.username;
            let password = req.body.password;

            if (session.isAuthenticated()) {
                res.send(this.serialize({
                    success: true,
                    data: session.getUserName()
                }));

                return;
            }

            // console.log(session, req.body, username, password);
            server.sessionManager?.authenticate(session, username, password).then(success => {
                res.status(success ? 200 : 401).send(this.serialize({
                    success: success,
                    error: success ? undefined : "Invalid username or password",
                    data: success ? username : undefined
                }))

            }).catch(err => {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Bad request"
                }));
            });
        });
    }
}

export class RouteLogout extends Route {
    setup(express: Application, server: Server): void {
        express.delete(server.relativePath("login"), async (req, res) => {
            let session: Session = res.locals.session;
            await server.sessionManager?.deauthenticate(session);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}

export class RouteRegister extends Route {
    validate(data: string | undefined): boolean {
        let success = data != undefined && data != "";
        return success;
    }

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
                condition: [],
                credentials: [],
                type: "patient"
            }
            //TODO validate data

            let inputValid = this.validate(data.username);
            inputValid &&= this.validate(data.firstName);
            inputValid &&= this.validate(data.lastName);
            inputValid &&= this.validate(data.passwordHash);
            inputValid &&= this.validate(data.gender);
            inputValid &&= this.validate(data.dob);

            if (!inputValid) {
                res.status(400).send(this.serialize({
                    success: false,
                    error: "Invalid input"
                }));
                return;
            }


            await server.sessionManager?.createUser(data);
            await server.sessionManager?.deauthenticate(session);
            await server.sessionManager?.authenticate(session, data.username, req.body.password);
            res.send(this.serialize({
                success: true
            }));
        });
    }
}
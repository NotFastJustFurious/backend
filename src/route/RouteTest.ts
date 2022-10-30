import { Application } from "express";
import { Server } from "../Server";
import { Route } from "./Route";

export default class TestRoute implements Route {
    setup(express: Application, server: Server): void {
        express.get(server.relativePath("test"), (req, res) => {
            res.send("Hello World!");
        });
    }
}
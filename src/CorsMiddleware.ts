import {Request, Response, NextFunction} from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        res.send();
    } else {
        next();
    }
}
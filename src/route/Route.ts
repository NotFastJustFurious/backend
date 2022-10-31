import * as Express from 'express';
import { Server } from '../Server';


export type ResponseBase = {
    success: boolean,
    error?: string,
    data?: object
}

export abstract class Route {
 
    serialize(response: ResponseBase): string{
        return JSON.stringify(response);
    }
 
    abstract setup(express: Express.Application, server: Server): void;
}
import * as Express from 'express';
import { Server } from '../Server';

export interface Route {

    setup(express: Express.Application, server: Server): void;

}
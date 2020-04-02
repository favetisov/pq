import { Request } from 'express-jwt';
import { Controller } from './controller';

export interface Route {
  method: 'get' | 'post';
  url: string;
  handler: (req: Request) => Promise<any>;
}

export const routes: Route[] = [
  /** Ping */
  { method: 'get', url: '/ping', handler: Controller.ping },

  /** Games */
  { method: 'get', url: '/games', handler: Controller.getGamesList },
  { method: 'post', url: '/games/create', handler: Controller.createGame },
  { method: 'post', url: '/games/:gameId/delete', handler: Controller.deleteGame },
];

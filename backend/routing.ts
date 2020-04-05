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
  { method: 'get', url: '/games/:gameId', handler: Controller.getGameInfo },
  { method: 'get', url: '/games/:gameId/:code', handler: Controller.getInfoByCode },
  { method: 'post', url: '/games/create', handler: Controller.createGame },
  { method: 'post', url: '/games/:gameId/:code/:roundId/:subroundId/evaluate_answer', handler: Controller.evaluate },
  { method: 'post', url: '/games/:gameId/edit', handler: Controller.editGame },
  { method: 'post', url: '/games/:gameId/add_team', handler: Controller.addTeam },
  { method: 'post', url: '/games/:gameId/remove_team', handler: Controller.removeTeam },
  { method: 'post', url: '/games/:gameId/assign_rounds_to_teams', handler: Controller.assignRoundsToTeams },
  { method: 'post', url: '/games/:gameId/update_round', handler: Controller.updateRound },
  { method: 'post', url: '/games/:gameId/update_state', handler: Controller.updateState },
  { method: 'post', url: '/games/:gameId/:code/submit_answer', handler: Controller.submitAnswer },
  { method: 'post', url: '/games/:gameId/delete', handler: Controller.deleteGame },
];

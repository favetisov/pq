import { Request } from 'express-jwt';
import { Game } from './models/game';
import { ControllerError } from './utils/errors';
import { App } from './app';
import { IoMessages } from '../io-messages';

export const Controller = {
  ping: async (req: Request) => {
    return { status: 'Backend is alive!' };
  },

  getGamesList: async (req: Request) => {
    const games = await Game.find();
    return games;
  },

  createGame: async (req: Request) => {
    if (!req.body.name) throw new ControllerError('Incorrect params', 400);
    const game = await new Game({ name: req.body.name }).save();
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return game;
  },

  deleteGame: async (req: Request) => {
    await Game.deleteOne({ _id: req.params.gameId });
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return { success: true };
  },
};

import { Request } from 'express-jwt';
import { Game } from './models/game';
import { ControllerError } from './utils/errors';
import { App } from './app';
import { IoMessages } from '../io-messages';
import * as md5 from 'js-md5';

export const Controller = {
  ping: async (req: Request) => {
    return { status: 'Backend is alive!' };
  },

  getGamesList: async (req: Request) => {
    const games = await Game.find();
    return games;
  },

  getGameInfo: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    return game;
  },

  createGame: async (req: Request) => {
    if (!req.body.name) throw new ControllerError('Incorrect params', 400);
    const game = await new Game({ name: req.body.name }).save();
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return game;
  },

  editGame: async (req: Request) => {
    if (!req.body.name) throw new ControllerError('Incorrect params', 400);
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { name: req.body.name });
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return { success: true };
  },

  deleteGame: async (req: Request) => {
    await Game.deleteOne({ _id: req.params.gameId });
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return { success: true };
  },

  addTeam: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);
    if (!game.teams) game.teams = [];
    const _id = Math.max(...game.teams.map((t) => t._id), 0) + 1;
    const code = md5(game._id + '::' + _id + '::' + req.body.name);
    const team = { name: req.body.name, _id, code };
    game.teams.push(team);
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });
    return team;
  },

  removeTeam: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);
    game.teams = game.teams.filter((t) => t._id != req.body._id);
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });
    return { success: true };
  },

  assignRoundsToTeams: async (req: Request) => {
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { rounds: req.body.rounds, teams: req.body.teams });
    return { success: true };
  },

  getInfoByCode: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);
    game.teams = game.teams.filter((t) => t.code == req.params.code);
    return game;
  },

  updateRound: async (req: Request) => {
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { currentRound: req.body.currentRound });
    App.io.emit(IoMessages.onGameRoundUpdated, { gameId: req.params.gameId, currentRound: req.body.currentRound });
    return { success: true };
  },

  updateState: async (req: Request) => {
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { state: req.body.state });
    App.io.emit(IoMessages.onGameStateUpdated, { gameId: req.params.gameId, state: req.body.state });
    return { success: true };
  },

  submitAnswer: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);

    const submittedTimestamp = new Date().getTime();
    game.teams.forEach((t) => {
      if (t.code == req.params.code) {
        t.rounds[req.body.currentRound] = req.body.teams.find((tm) => tm.code == req.params.code).rounds[
          req.body.currentRound
        ];
        t.rounds[req.body.currentRound].submittedTimestamp = submittedTimestamp;
      }
    });
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });
    App.io.emit(IoMessages.onAnswerSubmitted, {
      gameId: req.params.gameId,
      teamId: req.body.teams.find((tm) => tm.code == req.params.code)._id,
      round: req.body.currentRound,
      submittedTimestamp,
    });
    return { success: true };
  },

  evaluate: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);

    game.teams.forEach((t) => {
      if (t.code == req.params.code) {
        const roundIdx = t.rounds.findIndex((r) => r._id == req.params.roundId);
        t.rounds[roundIdx] = req.body;
      }
    });
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });

    App.io.emit(IoMessages.onAnswerEvaluated, {
      gameId: req.params.gameId,
      teamId: game.teams.find((tm) => tm.code === req.params.code)._id,
      roundId: req.params.roundId,
      score: req.body.score,
    });

    return { success: true };
  },
};

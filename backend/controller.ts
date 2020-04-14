import { Request } from 'express-jwt';
import { Game } from './models/game';
import { ControllerError } from './utils/errors';
import { App } from './app';
import { IoMessages } from '../io-messages';
import * as md5 from 'js-md5';
import { existsSync, mkdirSync } from 'fs';
import { writeBase64ToFile } from './utils/base64ToFile';

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

  getBroadcastInfo: async (req: Request) => {
    const game = await Game.findById(req.params.gameId).lean();
    game.teams.forEach((t) => {
      delete t.code;
      t.rounds.forEach((r) => {
        r.subrounds.forEach((sr) => {
          delete sr.fields;
        });
      });
    });
    game.broadcast.resolvedSlide = game.broadcast.slides[game.broadcast.currentSlide];
    delete game.broadcast.slides;
    return game;
  },

  createGame: async (req: Request) => {
    if (!req.body.name) throw new ControllerError('Incorrect params', 400);
    const game = await new Game({
      name: req.body.name,
      twitchChannel: req.body.twitchChannel,
      youtubeLive: req.body.youtubeLive,
    }).save();
    App.io.emit(IoMessages.onGamesListUpdated, await Controller.getGamesList(req));
    return game;
  },

  editGame: async (req: Request) => {
    if (!req.body.name) throw new ControllerError('Incorrect params', 400);
    await Game.findOneAndUpdate(
      { _id: req.params.gameId },
      { name: req.body.name, twitchChannel: req.body.twitchChannel, youtubeLive: req.body.youtubeLive },
    );
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
    await Game.findOneAndUpdate(
      { _id: req.params.gameId },
      { currentRound: req.body.currentRound, currentSubround: req.body.currentSubround },
    );
    App.io.emit(IoMessages.onGameRoundUpdated, {
      gameId: req.params.gameId,
      currentRound: req.body.currentRound,
      currentSubround: req.body.currentSubround,
    });
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
    const team = game.teams.find((t) => t.code === req.params.code);
    team.rounds[req.body.currentRound].subrounds[req.body.currentSubround] = req.body.teams.find(
      (tm) => tm.code == req.params.code,
    ).rounds[req.body.currentRound].subrounds[req.body.currentSubround];
    team.rounds[req.body.currentRound].subrounds[req.body.currentSubround].submittedTimestamp = submittedTimestamp;
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });
    App.io.emit(IoMessages.onAnswerSubmitted, {
      gameId: req.params.gameId,
      teamId: req.body.teams.find((tm) => tm.code == req.params.code)._id,
      round: req.body.currentRound,
      subround: req.body.currentSubround,
      submittedTimestamp,
    });
    return { success: true };
  },

  evaluate: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);

    const team = game.teams.find((t) => t.code === req.params.code);
    const roundIdx = team.rounds.findIndex((r) => r._id == req.params.roundId);
    const subroundIdx = team.rounds[roundIdx].subrounds.findIndex((sr) => sr._id == req.params.subroundId);
    team.rounds[roundIdx].subrounds[subroundIdx] = req.body;
    await Game.findOneAndUpdate({ _id: req.params.gameId }, { teams: game.teams });

    App.io.emit(IoMessages.onAnswerEvaluated, {
      gameId: req.params.gameId,
      teamId: game.teams.find((tm) => tm.code === req.params.code)._id,
      round: roundIdx,
      subround: subroundIdx,
      score: req.body.score,
    });

    return { success: true };
  },

  uploadSlides: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);

    const dirPath = __dirname + '/public/slides/' + game._id;
    // existsSync(dirPath) && rmdirSync(dirPath, { recursive: true });
    if (!existsSync(dirPath)) mkdirSync(dirPath);

    const slides = [];
    for (const idx in req.body.slides) {
      const fileName = md5(game._id + Math.floor(Math.random() * 1000) + idx) + '.jpg';
      await writeBase64ToFile(req.body.slides[idx], dirPath + '/' + fileName);
      slides.push(fileName);
    }

    game.broadcast = { slides, currentSlide: 0, currentMode: 'table', inProgress: false };
    await game.save();

    return slides;
  },

  updateBroadcastState: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);
    if (!game.broadcast) throw new ControllerError('NO_BROADCAST_IN_GAME', 400);

    await Game.findByIdAndUpdate(game._id, { broadcast: req.body.broadcast });

    App.io.emit(IoMessages.onBroadcastUpdated, {
      gameId: req.params.gameId,
      resolvedSlide: req.body.broadcast.slides[req.body.broadcast.currentSlide],
      currentMode: req.body.broadcast.currentMode,
      inProgress: req.body.broadcast.inProgress,
    });

    return { success: true };
  },

  setTimer: async (req: Request) => {
    const game = await Game.findById(req.params.gameId);
    if (!game) throw new ControllerError('ITEM_NOT_FOUND', 400);
    console.log('sending', IoMessages.onTimerStarted, {
      gameId: req.params.gameId,
      running: req.body.running,
      seconds: req.body.seconds,
    });

    App.io.emit(IoMessages.onTimerStarted, {
      gameId: req.params.gameId,
      running: req.body.running,
      seconds: req.body.seconds,
    });
    return { success: true };
  },
};

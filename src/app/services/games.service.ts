import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Requester } from 'app/tools/requester';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { Game } from 'app/models/game.model';
import { Socket } from 'ngx-socket-io';
import { IoMessages } from '../../../io-messages';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  public readonly LS_KEY = 'games';
  ready$ = new AsyncSubject();
  public games$: BehaviorSubject<Game[]> = new BehaviorSubject(null);

  constructor(private requester: Requester, private storage: Storage, private socket: Socket) {
    this.init();
  }

  async init() {
    const games = await this.storage.get(this.LS_KEY);
    if (games) this.games$.next(games);
    this.ready$.next(true);
    this.ready$.complete();

    this.games$.subscribe((games) => {
      this.storage.set(this.LS_KEY, games);
    });
  }

  async loadGames() {
    await this.ready$.toPromise();
    this.games$.next((await this.requester.load('/games')).map((g) => new Game(g)));
    return this.games$.getValue();
  }

  async loadGameInfo(gameId) {
    await this.ready$.toPromise();
    const game = new Game(await this.requester.load(`/games/${gameId}`));
    return game;
  }
  async loadBroadcastInfo(gameId) {
    await this.ready$.toPromise();
    const game = await this.requester.load(`/games/${gameId}/live`);
    return game;
  }

  async listenGamesList() {
    await this.ready$.toPromise();
    this.socket.on(IoMessages.onGamesListUpdated, (games) => {
      this.games$.next(games.map((g) => new Game(g)));
    });
  }

  async createGame(game: Game) {
    await this.ready$.toPromise();
    const createdGame = await this.requester.load({
      method: 'POST',
      url: '/games/create',
      params: game,
    });
    return createdGame;
  }

  async editGame(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/edit`,
      params: game,
    });
    return { success: true };
  }

  async addTeam(game: Game, team) {
    await this.ready$.toPromise();
    const addedTeam = await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/add_team`,
      params: team,
    });
    return addedTeam;
  }

  async removeTeam(game: Game, team) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/remove_team`,
      params: team,
    });
    return { success: true };
  }

  async deleteGame(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/delete`,
    });
    return { success: true };
  }

  async assignRoundsToTeams(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/assign_rounds_to_teams`,
      params: game,
    });
    return { success: true };
  }

  async getInfoByCode(gameId: string, code: string) {
    await this.ready$.toPromise();
    const game = await this.requester.load(`/games/${gameId}/${code}`);
    return game;
  }

  async updateRound(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/update_round`,
      params: { currentRound: game.currentRound, currentSubround: game.currentSubround },
    });
    return { success: true };
  }

  async updateState(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/update_state`,
      params: { state: game.state },
    });
    return { success: true };
  }

  async submitAnswer(game: Game, code: string) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/${code}/submit_answer`,
      params: game,
    });
    return { success: true };
  }

  async evaluate(game: Game, code: string, round, subround) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/${code}/${round._id}/${subround._id}/evaluate_answer`,
      params: subround,
    });
    return { success: true };
  }

  async revertAnswers(game: Game, code: string, round, subround) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/${code}/${round._id}/${subround._id}/evaluate_answer`,
      params: round,
    });
    return { success: true };
  }

  async uploadSlides(game: Game, slides: string[]) {
    await this.ready$.toPromise();
    const savedSlides = await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/upload_slides`,
      params: { slides },
    });
    return savedSlides;
  }

  async updateBroadcastState(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/update_broadcast`,
      params: game,
    });
    return { success: true };
  }

  onGameRoundUpdated(gameId: string) {
    return this.socket.fromEvent(IoMessages.onGameRoundUpdated).pipe(
      tap((c) => console.log(c, 'received')),
      filter((e: any) => e.gameId == gameId),
    );
  }

  onGameStateUpdated(gameId: string) {
    return this.socket.fromEvent(IoMessages.onGameStateUpdated).pipe(filter((e: any) => e.gameId == gameId));
  }

  onAnswerSubmitted(gameId: string) {
    return this.socket.fromEvent(IoMessages.onAnswerSubmitted).pipe(filter((e: any) => e.gameId == gameId));
  }

  onAnswerEvaluated(gameId: string) {
    return this.socket.fromEvent(IoMessages.onAnswerEvaluated).pipe(filter((e: any) => e.gameId == gameId));
  }

  onBroadcastUpdated(gameId: string) {
    return this.socket.fromEvent(IoMessages.onBroadcastUpdated).pipe(filter((e: any) => e.gameId == gameId));
  }
}

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Requester } from 'app/tools/requester';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { Game } from 'app/models/game.model';
import { Socket } from 'ngx-socket-io';
import { IoMessages } from '../../../io-messages';

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

  async deleteGame(game: Game) {
    await this.ready$.toPromise();
    await this.requester.load({
      method: 'POST',
      url: `/games/${game._id}/delete`,
    });
    return { success: true };
  }
}

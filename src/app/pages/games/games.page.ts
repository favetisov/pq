import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { GamesService } from 'app/services/games.service';
import { takeUntil, filter } from 'rxjs/operators';
import isNil from 'lodash-es/isNil';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit, OnDestroy {
  state = {
    loading: true,
  };

  games$ = this.gamesService.games$;
  sort$ = new BehaviorSubject({ key: 'timestamp', order: 'desc' });
  onDestroyed$ = new AsyncSubject();

  constructor(private gamesService: GamesService) {}

  async ngOnInit() {
    this.gamesService.loadGames();
    this.gamesService.listenGamesList();
    // this.gamesService.listenGamesList();
    this.gamesService.games$
      .pipe(
        takeUntil(this.onDestroyed$),
        filter((g) => !isNil(g)),
      )
      .subscribe((games) => {
        this.state.loading = false;
      });
  }

  async ngOnDestroy() {
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }
}

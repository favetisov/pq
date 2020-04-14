import { Component, OnDestroy, OnInit } from '@angular/core';
import { GamesService } from 'app/services/games.service';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'app/models/game.model';
import { takeUntil } from 'rxjs/operators';
import { AsyncSubject } from 'rxjs';

@Component({
  selector: 'broadcast-page',
  templateUrl: './broadcast.page.html',
  styleUrls: ['./broadcast.page.scss'],
})
export class BroadcastPage implements OnInit, OnDestroy {
  state = {
    loading: true,
  };
  onDestroyed$ = new AsyncSubject();

  game: Game;
  constructor(private gamesService: GamesService, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.game = await this.gamesService.loadBroadcastInfo(this.route.snapshot.paramMap.get('gameId'));
    this.gamesService
      .onBroadcastUpdated(this.game._id)
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe((e: any) => {
        this.game.broadcast.resolvedSlide = e.resolvedSlide;
        this.game.broadcast.currentMode = e.currentMode;
        this.game.broadcast.inProgress = e.inProgress;
      });

    this.state.loading = false;
  }

  async ngOnDestroy() {
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }
}

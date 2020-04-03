import { Component, OnDestroy, OnInit } from '@angular/core';
import { GamesService } from 'app/services/games.service';
import { ActivatedRoute } from '@angular/router';
import { Game, GameState } from 'app/models/game.model';
import { AsyncSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'client-form-page',
  templateUrl: './client-form.page.html',
  styleUrls: ['./client-form.page.scss'],
})
export class ClientFormPage implements OnInit, OnDestroy {
  state = {
    loading: true,
    submitting: false,
    submitConfirm: false,
  };

  onDestroyed$ = new AsyncSubject();

  game: Game;
  team;
  round;
  GameState = GameState;

  constructor(private gamesService: GamesService, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.game = await this.gamesService.getInfoByCode(
      this.route.snapshot.paramMap.get('gameId'),
      this.route.snapshot.paramMap.get('code'),
    );
    this.team = this.game.teams[0];
    this.round = this.team.rounds[this.game.currentRound];
    this.gamesService
      .onGameRoundUpdated(this.game._id)
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe((e: any) => {
        this.game.currentRound = e.currentRound;
        this.round = this.team.rounds[this.game.currentRound];
      });

    this.gamesService
      .onGameStateUpdated(this.game._id)
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe((e: any) => {
        this.game.state = e.state;
      });

    this.state.loading = false;
  }

  async ngOnDestroy() {
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }

  async submit() {
    this.state.submitting = true;
    try {
      this.game.teams[0].rounds[this.game.currentRound].submittedTimestamp = new Date().getTime();
      await this.gamesService.submitAnswer(this.game, this.route.snapshot.paramMap.get('code'));
      this.state.submitConfirm = false;
    } catch (e) {}
    this.state.submitting = false;
  }
}

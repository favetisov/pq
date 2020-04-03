import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { Game } from 'app/models/game.model';
import { GamesService } from 'app/services/games.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'admin-form-page',
  templateUrl: './admin-form.page.html',
  styleUrls: ['./admin-form.page.scss'],
})
export class AdminFormPage implements OnInit, OnDestroy {
  state = {
    loading: true,
    evaluating: false,
    confirmRevert: false,
  };

  onDestroyed$ = new AsyncSubject();

  game: Game;
  team;
  round;

  constructor(private gamesService: GamesService, private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    this.game = await this.gamesService.getInfoByCode(
      this.route.snapshot.paramMap.get('gameId'),
      this.route.snapshot.paramMap.get('code'),
    );
    this.team = this.game.teams[0];
    const roundId = this.route.snapshot.paramMap.get('roundId');
    this.round = this.team.rounds.find((r) => r._id == roundId);
    this.state.loading = false;
  }

  async ngOnDestroy() {
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }

  async evaluate() {
    this.state.evaluating = true;
    try {
      this.round.evaluated = true;
      await this.gamesService.evaluate(this.game, this.route.snapshot.paramMap.get('code'), this.round);
      this.router.navigate(['/games', this.game._id, this.game.name]);
    } catch (e) {}
    this.state.evaluating = false;
  }

  async revertAnswers() {
    this.state.evaluating = true;
    try {
      this.round.evaluated = true;
      this.round.submittedTimestamp = null;
      await this.gamesService.revertAnswers(this.game, this.route.snapshot.paramMap.get('code'), this.round);
      this.state.confirmRevert = false;
    } catch (e) {}
    this.state.evaluating = false;
  }

  formatTime(ts) {
    return moment(ts).format('HH:mm:ss');
  }
}

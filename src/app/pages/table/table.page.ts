import { Component, OnInit } from '@angular/core';
import { Game, GameState } from 'app/models/game.model';
import { GamesService } from 'app/services/games.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'table-page',
  templateUrl: './table.page.html',
  styleUrls: ['./table.page.scss'],
})
export class TablePage implements OnInit {
  state = {
    loading: true,
  };
  game: Game;
  GameState = GameState;
  constructor(private route: ActivatedRoute, private gamesService: GamesService) {}

  async ngOnInit() {
    this.game = await this.gamesService.loadGameInfo(this.route.snapshot.paramMap.get('gameId'));
    this.state.loading = false;
  }

  calculateTeamScore(team) {
    const score = team.rounds.reduce((sum, r) => {
      sum += r.subrounds.reduce((sum, r) => {
        if (r.evaluated) sum += r.score;
        return sum;
      }, 0);
      return sum;
    }, 0);
    return score;
  }

  calculateRoundScore(round) {
    if (!round.subrounds.some((s) => s.evaluated)) return '';
    const score = round.subrounds.reduce((sum, r) => {
      if (r.evaluated) sum += r.score;
      return sum;
    }, 0);
    return score;
  }
}

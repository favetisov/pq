import { Component, OnInit, ViewChild } from '@angular/core';
import { Game, GameState } from 'app/models/game.model';
import { GameFormComponent } from 'app/pages/games/game-form/game-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { notEmptyValidator } from 'app/tools/validators';
import { GamesService } from 'app/services/games.service';
import { availableRounds } from 'app/pages/game-edit/available-rounds';

@Component({
  selector: 'game-edit-page',
  templateUrl: './game-edit.page.html',
  styleUrls: ['./game-edit.page.scss'],
})
export class GameEditPage implements OnInit {
  state = {
    loading: true,
    savingInfo: false,
    editingTeam: false,
    editingRound: false,
    addingTeamMode: false,
    revertConfirm: false,
    deleteConfirm: false,
  };

  GameState = GameState;
  availableRounds = availableRounds;

  validators = {
    teamName: [notEmptyValidator],
  };
  game: Game;
  @ViewChild(GameFormComponent, { static: true }) gameForm: GameFormComponent;
  newTeamName: string;

  constructor(private route: ActivatedRoute, private router: Router, private gamesService: GamesService) {}

  async ngOnInit() {
    this.game = await this.gamesService.loadGameInfo(this.route.snapshot.paramMap.get('gameId'));
    if (!this.game.rounds.length) this.game.rounds = availableRounds.filter((r) => r.enabledByDefault);
    if (this.game.teams.some((t) => !t.rounds)) this.assignRoundsToTeams();

    this.gamesService.onAnswerSubmitted(this.game._id).subscribe((e: any) => {
      this.game.teams.find((t) => t._id === e.teamId).rounds[e.round].subrounds[e.subround].submittedTimestamp =
        e.submittedTimestamp;
    });
    this.gamesService.onAnswerEvaluated(this.game._id).subscribe((e: any) => {
      const subround = this.game.teams.find((t) => t._id === e.teamId).rounds[e.round].subrounds[e.subround];
      subround.score = e.score;
      subround.evaluated = e.evaluted;
    });

    this.state.loading = false;
  }

  async editGame() {
    if (await this.gameForm.isValid()) {
      this.state.savingInfo = true;
      try {
        await this.gamesService.editGame(this.game);
        this.router.navigate(['/games']);
      } catch (e) {}
      this.state.savingInfo = false;
    }
  }

  async deleteGame() {
    if (await this.gameForm.isValid()) {
      this.state.savingInfo = true;
      try {
        await this.gamesService.deleteGame(this.game);
        this.router.navigate(['/games']);
      } catch (e) {}
      this.state.savingInfo = false;
    }
  }

  async addTeam() {
    if (this.game.state !== GameState.NOT_STARTED) return;
    if (!this.newTeamName) return;
    this.state.editingTeam = true;
    try {
      const team = await this.gamesService.addTeam(this.game, { name: this.newTeamName });
      this.game.teams.push(team);
      this.newTeamName = '';
      this.assignRoundsToTeams();
    } catch (e) {}
    this.state.editingTeam = false;
    this.state.addingTeamMode = false;
  }

  async removeTeam(team) {
    if (this.game.state !== GameState.NOT_STARTED) return;
    this.state.editingTeam = true;
    try {
      await this.gamesService.removeTeam(this.game, team);
      this.game.teams = this.game.teams.filter((t) => t._id != team._id);
    } catch (e) {}
    this.state.editingTeam = false;
  }

  isRoundIncluded(round) {
    return this.game.rounds.some((r) => r._id === round._id);
  }

  toggleRound(round) {
    if (this.game.state !== GameState.NOT_STARTED) return;
    this.state.editingRound = true;
    try {
      if (this.isRoundIncluded(round)) {
        this.game.rounds = this.game.rounds.filter((r) => r._id != round._id);
      } else {
        this.game.rounds.push(round);
      }
      this.assignRoundsToTeams();
    } catch (e) {}
    this.state.editingRound = false;
  }

  async assignRoundsToTeams() {
    this.game.teams.forEach((t) => {
      t.rounds = this.game.rounds.map((r) => ({
        _id: r._id,
        name: r.name,
        subrounds: r.subrounds.map((sr) => ({
          _id: sr._id,
          submittedTimestamp: null,
          evaluated: false,
          score: null,
          fields: sr.schema.map((s) => ({
            fieldId: s.fieldId,
            first: s.first,
            second: s.second,
            score: null,
          })),
        })),
      }));
    });
    await this.gamesService.assignRoundsToTeams(this.game);
  }

  calculateTeamScore(team) {
    const score = team.rounds.reduce((sum, r) => {
      if (r.evaluated) sum += r.score;
      return sum;
    }, 0);
    return score;
  }

  startGame() {
    this.game.state = GameState.IN_PROGRESS;
    this.gamesService.updateState(this.game);
  }

  async revertGame() {
    this.game.state = GameState.NOT_STARTED;
    this.game.currentRound = 0;
    this.game.currentSubround = 0;
    await this.assignRoundsToTeams();
    await this.gamesService.updateRound(this.game);
    await this.gamesService.updateState(this.game);
    this.state.revertConfirm = false;
  }

  finishGame() {
    this.game.state = GameState.FINISHED;
    this.gamesService.updateState(this.game);
  }

  reopenGame() {
    this.game.state = GameState.IN_PROGRESS;
    this.gamesService.updateState(this.game);
  }

  startNewRound() {
    if (this.game.currentSubround < this.game.rounds[this.game.currentRound].subrounds.length - 1) {
      this.game.currentSubround++;
    } else {
      this.game.currentRound++;
      this.game.currentSubround = 0;
    }
    console.log(this.game);
    this.gamesService.updateRound(this.game);
  }

  toPrevRound() {
    if (this.game.currentSubround > 0) {
      this.game.currentSubround--;
    } else {
      this.game.currentRound--;
      this.game.currentSubround = 0;
    }
    this.gamesService.updateRound(this.game);
  }
}

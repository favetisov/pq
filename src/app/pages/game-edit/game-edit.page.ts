import { Component, OnInit, ViewChild } from '@angular/core';
import { Game, GameState } from 'app/models/game.model';
import { GameFormComponent } from 'app/pages/games/game-form/game-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { notEmptyValidator } from 'app/tools/validators';
import * as md5 from 'js-md5';
import { GamesService } from 'app/services/games.service';

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
  };

  GameState = GameState;

  availableRounds = [
    {
      _id: 0,
      name: 'Снова в школу',
      enabledByDefault: true,
      schema: [
        { fieldId: 0, first: '' },
        { fieldId: 1, first: '' },
        { fieldId: 2, first: '' },
        { fieldId: 3, first: '' },
        { fieldId: 4, first: '' },
        { fieldId: 5, first: '' },
        { fieldId: 6, first: '' },
        { fieldId: 7, first: '' },
        { fieldId: 8, first: '' },
        { fieldId: 9, first: '' },
        { fieldId: 10, first: '' },
        { fieldId: 11, first: '' },
      ],
    },
    { _id: 1, name: 'А где это было?', enabledByDefault: true, schema: [] },
    { _id: 2, name: 'Кто это сказал?', enabledByDefault: true, schema: [] },
    { _id: 3, name: 'Музыкальный', enabledByDefault: false, schema: [] },
    { _id: 4, name: 'Четвёртый лишний', enabledByDefault: true, schema: [] },
    { _id: 5, name: 'По буквам', enabledByDefault: true, schema: [] },
    { _id: 6, name: 'С первой подсказки', enabledByDefault: true, schema: [] },
  ];

  validators = {
    teamName: [notEmptyValidator],
  };
  game: Game;
  @ViewChild(GameFormComponent) gameForm: GameFormComponent;
  newTeamName: string;

  constructor(private route: ActivatedRoute, private router: Router, private gamesService: GamesService) {}

  async ngOnInit() {
    this.game = new Game({
      _id: this.route.snapshot.paramMap.get('gameId'),
      name: this.route.snapshot.paramMap.get('gameTitle'),
    });
    if (!this.game.rounds.length) this.game.rounds = this.availableRounds.filter((r) => r.enabledByDefault);
    this.state.loading = false;
  }

  async editGame() {
    if (await this.gameForm.isValid()) {
      this.state.savingInfo = true;
      try {
        this.router.navigate(['/games']);
      } catch (e) {}
      this.state.savingInfo = false;
    }
  }

  async deleteGame() {
    if (await this.gameForm.isValid()) {
      this.state.savingInfo = true;
      try {
        this.gamesService.deleteGame(this.game);
        this.router.navigate(['/games']);
      } catch (e) {}
      this.state.savingInfo = false;
    }
  }

  addTeam() {
    if (this.game.state !== GameState.NOT_STARTED) return;
    if (!this.newTeamName) return;
    this.state.editingTeam = true;
    try {
      this.game.teams.push({ _id: '1', name: this.newTeamName, code: md5('1' + this.newTeamName), rounds: [] });
      this.newTeamName = '';
    } catch (e) {}
    this.state.editingTeam = false;
    this.state.addingTeamMode = false;
  }

  removeTeam(team) {
    if (this.game.state !== GameState.NOT_STARTED) return;
    this.state.editingTeam = true;
    try {
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

  assignRoundsToTeams() {
    this.game.teams.forEach((t) => {
      t.rounds = this.game.rounds.map((r) => ({
        roundId: r._id,
        submittedTimestamp: null,
        fields: r.schema.map((s) => ({
          fieldId: s.fieldId,
          first: s.first,
          second: s.second,
          points: 0,
        })),
      }));
    });
  }

  calculateTeamScore(team) {
    const score = team.rounds.reduce((sum, r) => {
      if (r.submittedTimestamp) sum += r.points;
      return sum;
    }, 0);
    return score;
  }

  startGame() {
    this.game.state = GameState.IN_PROGRESS;
  }

  revertGame() {
    this.game.state = GameState.NOT_STARTED;
    this.game.currentRound = 0;
    this.assignRoundsToTeams();
    this.state.revertConfirm = false;
  }

  finishGame() {
    this.game.state = GameState.FINISHED;
  }

  reopenGame() {
    this.game.state = GameState.IN_PROGRESS;
  }

  startNewRound() {
    this.game.currentRound++;
  }

  toPrevRound() {
    this.game.currentRound--;
  }
}

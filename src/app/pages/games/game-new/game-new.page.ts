import { Component, OnInit, ViewChild } from '@angular/core';
import { Game } from 'app/models/game.model';
import { GameFormComponent } from 'app/pages/games/game-form/game-form.component';
import { Router } from '@angular/router';
import { GamesService } from 'app/services/games.service';

@Component({
  selector: 'game-new-page',
  templateUrl: './game-new.page.html',
  styleUrls: ['./game-new.page.scss'],
})
export class GameNewPage implements OnInit {
  state = {
    loading: true,
    saving: false,
  };

  game: Game;
  @ViewChild('gameForm', { static: false }) gameForm: GameFormComponent;

  constructor(private router: Router, private gamesService: GamesService) {}

  async ngOnInit() {
    this.game = new Game();
    this.state.loading = false;
  }

  async createGame() {
    if (await this.gameForm.isValid()) {
      this.state.saving = true;
      try {
        this.game = await this.gamesService.createGame(this.game);
        this.router.navigate([`/games/${this.game._id}/${this.game.name}`]);
      } catch (e) {}
      this.state.saving = false;
    }
  }
}

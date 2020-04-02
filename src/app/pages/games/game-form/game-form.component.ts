import { Component, OnInit, Input } from '@angular/core';
import { AbstractFormComponent } from 'app/components/abstract.form.component';
import { notEmptyValidator } from 'app/tools/validators';
import { Game } from 'app/models/game.model';

@Component({
  selector: 'game-form',
  templateUrl: './game-form.component.html',
  styleUrls: ['./game-form.component.scss'],
})
export class GameFormComponent extends AbstractFormComponent implements OnInit {
  @Input() game: Game;
  validators = {
    name: [notEmptyValidator],
  };

  constructor() {
    super();
  }

  async ngOnInit() {}
}

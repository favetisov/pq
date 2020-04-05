import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-quatro-round',
  templateUrl: './admin-quatro-round.component.html',
  styleUrls: ['./admin-quatro-round.component.scss'],
})
export class AdminQuatroRoundComponent implements OnInit {
  @Input() round;
  @Input() subround;
  checkmarks = Array(6).fill([false, false]);
  constructor() {}

  async ngOnInit() {
    this.checkmarks = this.subround.fields.map((f) => {
      if (!f.score) return [false, false];
      if (f.score == 1) return [true, false];
      if (f.score == 3) return [false, true];
      if (f.score == 4) return [true, true];
    });
  }

  toggleCheckmark(number, field) {
    this.checkmarks[number][field] = !this.checkmarks[number][field];
    this.subround.fields[number].score = (this.checkmarks[number][0] ? 1 : 0) + (this.checkmarks[number][1] ? 3 : 0);
    this.updateTotalScore();
  }

  updateTotalScore() {
    this.subround.score = this.subround.fields.reduce((sum, field) => {
      if (field.score) sum += field.score;
      return sum;
    }, 0);
  }
}

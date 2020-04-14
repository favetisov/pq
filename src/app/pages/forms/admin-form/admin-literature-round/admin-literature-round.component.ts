import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-literature-round',
  templateUrl: './admin-literature-round.component.html',
  styleUrls: ['./admin-literature-round.component.scss'],
})
export class AdminLiteratureRoundComponent implements OnInit {
  @Input() round;
  @Input() subround;
  checkmarks = Array(7).fill([false, false]);
  constructor() {}

  async ngOnInit() {
    this.checkmarks = this.subround.fields.map((f) => {
      if (!f.score) return [false, false];
      if (f.score == 0.5) return [false, true];
      if (f.score == 1.5) return [true, false];
      if (f.score == 2) return [true, true];
    });
  }

  toggleCheckmark(number, field) {
    this.checkmarks[number][field] = !this.checkmarks[number][field];
    this.subround.fields[number].score =
      (this.checkmarks[number][0] ? 1.5 : 0) + (this.checkmarks[number][1] ? 0.5 : 0);
    this.updateTotalScore();
  }

  updateTotalScore() {
    this.subround.score = this.subround.fields.reduce((sum, field) => {
      if (field.score) sum += field.score;
      return sum;
    }, 0);
  }
}

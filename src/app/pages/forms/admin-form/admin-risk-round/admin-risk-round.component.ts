import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-risk-round',
  templateUrl: './admin-risk-round.component.html',
  styleUrls: ['./admin-risk-round.component.scss'],
})
export class AdminRiskRoundComponent implements OnInit {
  @Input() round;
  @Input() subround;
  checkmarks = Array(3).fill(false);
  constructor() {}

  async ngOnInit() {
    this.checkmarks = [this.subround.score == 1, this.subround.score == 2, this.subround.score == 3];
  }

  toggleCheckmark(number) {
    if (!this.checkmarks[number]) {
      this.checkmarks = this.checkmarks.map((c, idx) => idx == number);
    } else {
      this.checkmarks = [false, false, false];
    }
    this.updateTotalScore();
  }

  updateTotalScore() {
    this.subround.score = this.checkmarks.some(Boolean) ? 3 - this.checkmarks.findIndex(Boolean) : 0;
  }
}

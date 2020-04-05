import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-school-round',
  templateUrl: './admin-school-round.component.html',
  styleUrls: ['./admin-school-round.component.scss'],
})
export class AdminSchoolRoundComponent implements OnInit {
  @Input() round;
  @Input() subround;
  checkmarks = Array(12).fill(false);
  constructor() {}

  async ngOnInit() {
    this.checkmarks = this.subround.fields.map((f) => Boolean(f.score));
  }

  toggleCheckmark(number) {
    this.checkmarks[number] = !this.checkmarks[number];
    this.subround.fields[number].score = this.checkmarks[number] ? 1 : 0;
    this.updateTotalScore();
  }

  updateTotalScore() {
    const firstPartScore = this.checkmarks.slice(0, 9).filter(Boolean).length;
    const secondPartScore = this.checkmarks.slice(9, 12).filter(Boolean).length === 3 ? 3 : 0;
    this.subround.score = firstPartScore + secondPartScore;
  }
}

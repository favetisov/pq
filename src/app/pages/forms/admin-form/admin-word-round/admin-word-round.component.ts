import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-word-round',
  templateUrl: './admin-word-round.component.html',
  styleUrls: ['./admin-word-round.component.scss'],
})
export class AdminWordRoundComponent implements OnInit {
  @Input() round;
  @Input() subround;
  checkmarks = Array(7).fill(false);
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
    const firstPartScore = this.checkmarks.slice(0, 6).filter(Boolean).length;
    const secondPartScore = this.checkmarks[6] ? 4 : 0;
    this.subround.score = firstPartScore + secondPartScore;
  }
}

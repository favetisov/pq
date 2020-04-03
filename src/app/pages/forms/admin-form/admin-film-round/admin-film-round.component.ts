import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'admin-film-round',
  templateUrl: './admin-film-round.component.html',
  styleUrls: ['./admin-film-round.component.scss'],
})
export class AdminFilmRoundComponent implements OnInit {
  @Input() round;
  checkmarks = Array(7).fill(false);
  constructor() {}

  async ngOnInit() {
    this.checkmarks = this.round.fields.map((f) => Boolean(f.score));
  }

  toggleCheckmark(number) {
    this.checkmarks[number] = !this.checkmarks[number];
    this.round.fields[number].score = this.checkmarks[number] ? 1 : 0;
    this.updateTotalScore();
  }

  updateTotalScore() {
    const firstPartScore = this.checkmarks.slice(0, 6).filter(Boolean).length;
    const secondPartScore = this.checkmarks[6] ? 4 : 0;
    this.round.score = firstPartScore + secondPartScore;
  }
}

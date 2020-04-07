import { Component, OnInit, Input } from '@angular/core';
import { environment as env } from '@env';
import { DomSanitizer } from '@angular/platform-browser';
import { Game } from 'app/models/game.model';

@Component({
  selector: 'live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
})
export class LiveComponent implements OnInit {
  @Input() game: Game;
  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit() {}

  getSlideUrl(slide) {
    return this.sanitizer.bypassSecurityTrustUrl(env.hosts.PHOTO + '/slides/' + this.game._id + '/' + slide);
  }

  calculateTeamScore(team) {
    const score = team.rounds.reduce((sum, r) => {
      sum += r.subrounds.reduce((sum, r) => {
        if (r.evaluated) sum += r.score;
        return sum;
      }, 0);
      return sum;
    }, 0);
    return score;
  }

  calculateRoundScore(round) {
    if (!round.subrounds.some((s) => s.evaluated)) return '';
    const score = round.subrounds.reduce((sum, r) => {
      if (r.evaluated) sum += r.score;
      return sum;
    }, 0);
    return score;
  }
}

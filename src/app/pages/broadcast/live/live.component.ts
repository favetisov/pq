import { Component, OnInit, Input } from '@angular/core';
import { environment as env } from '@env';
import { DomSanitizer } from '@angular/platform-browser';
import { Game } from 'app/models/game.model';
import * as Twitch from 'twitch-embed';

@Component({
  selector: 'live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
})
export class LiveComponent {
  @Input() game: Game;
  @Input() silentMode;
  clicked: false;
  constructor(private sanitizer: DomSanitizer) {}

  async ngAfterContentInit() {
    if (!this.silentMode) {
      const player = new Twitch.PlayerEmbed('twitch', {
        height: 100,
        width: Math.min(800, window.innerWidth),
        channel: this.game.twitchChannel,
        autoplay: true,
      });
      console.log(player.getMuted());
      // player.setVolume(1);
      // console.log(player);
    }
  }

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

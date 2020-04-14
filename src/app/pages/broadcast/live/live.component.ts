import { Component, OnInit, Input } from '@angular/core';
import { environment as env } from '@env';
import { DomSanitizer } from '@angular/platform-browser';
import { Game } from 'app/models/game.model';
import * as Twitch from 'twitch-embed';
import orderBy from 'lodash-es/orderBy';
import { Socket } from 'ngx-socket-io';
import { IoMessages } from '../../../../../io-messages';
import { interval, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GamesService } from 'app/services/games.service';

@Component({
  selector: 'live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
})
export class LiveComponent implements OnInit {
  @Input() game: Game;
  @Input() silentMode;
  clicked: false;
  timerRunning = false;
  timerLeft = 0;
  src;
  constructor(private sanitizer: DomSanitizer, private gameService: GamesService) {}

  ngOnInit() {
    if (this.game.youtubeLive) {
      console.log('im in');
      this.src = this.getYoutubeSrc();
    }
    this.gameService.onTimerUpdated(this.game._id).subscribe((e) => {
      this.timerRunning = e.running;
      this.timerLeft = e.seconds;
    });
    interval(1000).subscribe(() => {
      if (this.timerLeft) this.timerLeft--;
    });
  }

  async ngAfterContentInit() {
    if (!this.silentMode && this.game.twitchChannel) {
      const player = new Twitch.PlayerEmbed('twitch', {
        height: 100,
        width: Math.min(800, window.innerWidth),
        channel: this.game.twitchChannel,
        autoplay: true,
      });
    }
    this.game.teams = orderBy(this.game.teams, [(t) => this.calculateTeamScore(t)], ['DESC']).reverse();
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

  getYoutubeSrc() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.game.youtubeLive}?rel=0&vq=tiny`,
    );
  }
}

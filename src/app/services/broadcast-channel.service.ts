import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs/index';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BroadcastChannelService {
  public readonly channelKey = 'axl-admin-channel';

  public broadcastChannel$;

  private channel;

  constructor() {
    if ('BroadcastChannel' in self) {
      this.channel = new BroadcastChannel(this.channelKey);
      this.broadcastChannel$ = fromEvent(this.channel, 'message').pipe(
        tap((message) => {
          console.log(message, 'broadcast message received');
        }),
      );
    }
  }

  publish(message) {
    if (this.channel) this.channel.postMessage(message);
  }

  subscribe(message, callback) {
    if (this.channel) this.broadcastChannel$.pipe(filter((m: any) => m.data == message)).subscribe(() => callback());
    callback();
  }
}

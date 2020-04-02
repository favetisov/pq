import { Injectable } from '@angular/core';
import { BehaviorSubject as BSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { distinctUntilChanged, skip } from 'rxjs/operators';
import { BroadcastChannelService } from 'app/services/broadcast-channel.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  public readonly LS_KEY = 'token';
  public readonly BROADCAST_KEY = 'token_updated';

  public token$: BSubject<string> = new BSubject(null);

  constructor(private storage: Storage, private broadcastChannelService: BroadcastChannelService) {
    this.init();
  }

  async init() {
    await this.loadTokenFromLS();

    this.token$.pipe(skip(1), distinctUntilChanged()).subscribe(async (token) => {
      await this.storage.set(this.LS_KEY, token);
      this.broadcastChannelService.publish(this.BROADCAST_KEY);
    });

    this.broadcastChannelService.subscribe(this.BROADCAST_KEY, () => this.loadTokenFromLS());
  }

  async loadTokenFromLS() {
    const token = await this.storage.get(this.LS_KEY);
    this.token$.next(token);
  }
}

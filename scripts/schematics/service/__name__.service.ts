import { Injectable } from '@angular/core';
import { Requester } from 'app/tools/requester';
import { BehaviorSubject as BSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { UserService } from 'app/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class __className__Service {
  public readonly LS_KEY = '__fileName__';

  public __camelName__$: BSubject<> /* todo add type */ = new BSubject /* todo add value */();

  constructor(private requester: Requester, private storage: Storage, private userService: UserService) {
    this.init();
  }

  async init() {
    const __camelName__ = await this.storage.get(this.LS_KEY);
    if (__camelName__) this.__camelName__$.next(__camelName__);

    this.__camelName__$.subscribe((__camelName__) => {
      this.storage.set(this.LS_KEY, __camelName__);
    });
  }
}

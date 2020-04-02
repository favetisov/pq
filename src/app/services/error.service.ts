import { Injectable } from '@angular/core';
import { BehaviorSubject as BSubject } from 'rxjs';

interface Error {
  message: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  public error$: BSubject<Error> = new BSubject(null);

  constructor() {}
}

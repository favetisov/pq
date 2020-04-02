import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs/index';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'app/services/error.service';
import { get as getVal } from 'lodash';
import { environment as env } from '@env';
import { TokenService } from 'app/services/token.service';

export interface RequesterOptions {
  url: string;
  host?: string;
  method?: string;
  params?: any;
  query?: any;
  noHeaders?: boolean;
  responseType?: 'text' | 'arraybuffer' | 'blob' | 'json';
}

@Injectable({
  providedIn: 'root',
})
export class Requester {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
    private errorService: ErrorService,
    private tokenService: TokenService,
  ) {}

  /** we are defining two different signatures so we can use simple get call like `load('http://google.com')` */
  async load(url: string);
  async load(options: RequesterOptions);

  async load(argument: any): Promise<any> {
    let options: RequesterOptions = typeof argument == 'string' ? { url: argument } : argument;

    if (!options.host) {
      options.host = options.url.indexOf('http') == 0 ? '' : env.hosts.API;
    }
    options.url = options.host + options.url;
    options.method = options.method || 'GET';
    options.params = options.params || {};
    options.query = options.query || {};
    options.responseType = options.responseType || null;

    const headers = new HttpHeaders({ AppKey: env.app.key });
    if (!options.noHeaders) {
      const token = this.tokenService.token$.getValue();
      if (token) {
        headers.set('Authorization', 'Bearer ' + token);
        headers.set('ClientLanguage', this.translateService.currentLang);
      }
    }

    return this.http
      .request(options.method, options.url, {
        body: options.params,
        headers,
        responseType: options.responseType,
      })
      .pipe(
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handleError(error);
          return throwError(error);
        }),
      )
      .toPromise();
  }

  async jsonp(url: string): Promise<any> {
    return this.http

      .jsonp(url, 'callback')
      .pipe(
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handleError(error);
          return throwError(error);
        }),
      )
      .toPromise();
  }

  private async handleError(error) {
    let message;
    if (!error.status || error.status == 0 || error.status == 504) {
      message = await this.translateService.get('ERROR.connection_lost').toPromise();
    } else if (error.status == 401) {
      message = await this.translateService.get('ERROR.not_authorized').toPromise();
    } else if (error.status == 500 || error.status == 502) {
      message = await this.translateService.get('ERROR.server_error').toPromise();
    } else if (error.statusText == 'Unknown Error') {
      message = await this.translateService.get('ERROR.server_error').toPromise();
    } else {
      message = getVal(error, 'error.error') || getVal(error, 'error', '');
    }

    this.errorService.error$.next({ message, status: error.status });
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GamesPage } from './pages/games/games.page';
import { AdmCardComponent } from './components/adm-card/adm-card.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AdmSpinnerComponent } from './components/adm-spinner/adm-spinner.component';
import {
  AdmListComponent,
  AdmListHeadCellComponent,
  AdmListHeadComponent,
  AdmListItemComponent,
} from './components/adm-list/adm-list.component';
import { AdmRotatingChevronComponent } from './components/adm-rotating-chevron/adm-rotating-chevron.component';
import { AdmIconComponent } from './components/adm-icon/adm-icon.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { GameNewPage } from './pages/games/game-new/game-new.page';
import { AppBreadcrumbsComponent } from './components/app-breadcrumbs/app-breadcrumbs.component';
import { GameFormComponent } from 'app/pages/games/game-form/game-form.component';
import {
  AdmCheckboxElementDirective,
  AdmDatepickerDirective,
  AdmElementContainerComponent,
  AdmInputElementDirective,
  AdmSelectElementDirective,
} from 'app/components/adm-element-container/adm-element-container.component';
import { AdmCheckboxComponent } from 'app/components/adm-element-container/adm-checkbox/adm-checkbox.component';
import { AdmPhotoLoaderComponent } from 'app/components/adm-element-container/adm-photo-loader/adm-photo-loader.component';
import {
  AdmSelectComponent,
  AdmSelectLabelTmpDirective,
  AdmSelectOptionTmpDirective,
} from 'app/components/adm-element-container/adm-select/adm-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { GameEditPage } from 'app/pages/game-edit/game-edit.page';
import { ClientFormPage } from 'app/pages/forms/client-form/client-form.page';
import { AdminFormPage } from 'app/pages/forms/admin-form/admin-form.page';
import { ClientSchoolRoundComponent } from 'app/pages/forms/client-form/client-school-round/client-school-round.component';
import { ClientFilmRoundComponent } from 'app/pages/forms/client-form/client-film-round/client-film-round.component';
import { ClientLiteratureRoundComponent } from 'app/pages/forms/client-form/client-literature-round/client-literature-round.component';
import { ClientQuatroRoundComponent } from 'app/pages/forms/client-form/client-quatro-round/client-quatro-round.component';
import { ClientWordRoundComponent } from 'app/pages/forms/client-form/client-word-round/client-word-round.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppErrorHandlerComponent } from 'app/components/app-error-handler/app-error-handler.component';
import { IonicStorageModule } from '@ionic/storage';
import { AdminSchoolRoundComponent } from 'app/pages/forms/admin-form/admin-school-round/admin-school-round.component';
import { AdminFilmRoundComponent } from 'app/pages/forms/admin-form/admin-film-round/admin-film-round.component';
import { AdminLiteratureRoundComponent } from 'app/pages/forms/admin-form/admin-literature-round/admin-literature-round.component';
import { AdminQuatroRoundComponent } from 'app/pages/forms/admin-form/admin-quatro-round/admin-quatro-round.component';
import { AdminWordRoundComponent } from 'app/pages/forms/admin-form/admin-word-round/admin-word-round.component';

const config: SocketIoConfig = { url: 'http://localhost:3019', options: {} };

const createTranslateLoader = (http: HttpClient) => {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
};

const initServices = (translateService: TranslateService) => {
  return async () => {
    translateService.setDefaultLang('ru');
  };
};

@NgModule({
  declarations: [
    AppComponent,
    GamesPage,
    GameNewPage,
    GameEditPage,
    GameFormComponent,
    ClientFormPage,
    AdminFormPage,
    ClientSchoolRoundComponent,
    ClientFilmRoundComponent,
    AppBreadcrumbsComponent,
    AdmCardComponent,
    AdmSpinnerComponent,
    AdmListComponent,
    AdmListItemComponent,
    AdmListHeadComponent,
    AdmListHeadCellComponent,
    AdmRotatingChevronComponent,
    AdmIconComponent,
    AdmElementContainerComponent,
    AdmCheckboxComponent,
    AdmPhotoLoaderComponent,
    AdmSelectComponent,
    AdmDatepickerDirective,
    AdmCheckboxElementDirective,
    AdmInputElementDirective,
    AdmSelectElementDirective,
    AdmSelectLabelTmpDirective,
    AdmSelectOptionTmpDirective,
    ClientLiteratureRoundComponent,
    ClientQuatroRoundComponent,
    ClientWordRoundComponent,
    AppErrorHandlerComponent,
    AdminSchoolRoundComponent,
    AdminFilmRoundComponent,
    AdminLiteratureRoundComponent,
    AdminQuatroRoundComponent,
    AdminWordRoundComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    SocketIoModule.forRoot(config),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    InlineSVGModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ImageCropperModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initServices,
      deps: [TranslateService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

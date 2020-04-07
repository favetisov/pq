import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamesPage } from './pages/games/games.page';
import { GameNewPage } from './pages/games/game-new/game-new.page';
import { GameEditPage } from 'app/pages/game-edit/game-edit.page';
import { ClientFormPage } from 'app/pages/forms/client-form/client-form.page';
import { AdminFormPage } from 'app/pages/forms/admin-form/admin-form.page';
import { TablePage } from 'app/pages/table/table.page';
import { BroadcastPage } from 'app/pages/broadcast/broadcast.page';

const routes: Routes = [
  { path: 'games', component: GamesPage, data: { breadcrumbs: [{ label: 'GAMES.games', link: 'games' }] } },
  {
    path: 'games/new',
    component: GameNewPage,
    data: {
      breadcrumbs: [
        { label: 'GAMES.games', link: 'games' },
        { label: 'GAMES.new_game', link: 'games/new' },
      ],
    },
  },
  {
    path: 'games/:gameId/:gameTitle',
    component: GameEditPage,
    data: {
      breadcrumbs: [
        { label: 'GAMES.games', link: 'games' },
        { label: ':gameTitle', link: 'games/:gameId/:gameTitle' },
      ],
    },
  },
  {
    path: 'games/:gameId/:gameTitle/table',
    component: TablePage,
    data: {
      breadcrumbs: [
        { label: 'GAMES.games', link: 'games' },
        { label: ':gameTitle', link: 'games/:gameId/:gameTitle' },
      ],
    },
  },
  {
    path: 'blanks/:gameId/:code',
    component: ClientFormPage,
    data: {
      breadcrumbs: [{ label: 'FORMS.answer_form', link: 'blanks/:gameId/:teamCode' }],
    },
  },
  {
    path: 'evaluate/:gameId/:gameTitle/:code/:roundId/:subroundId',
    component: AdminFormPage,
    data: {
      breadcrumbs: [
        { label: 'GAMES.games', link: 'games' },
        { label: ':gameTitle', link: 'games/:gameId/:gameTitle' },
        { label: 'FORMS.evaluate_form', link: 'evaluate/:gameId/:teamCode/:roundId/:subroundId' },
      ],
    },
  },
  {
    path: 'live/:gameId/:gameTitle',
    component: BroadcastPage,
    data: {
      breadcrumbs: [{ label: ':gameTitle', link: 'live/:gameId/:gameTitle' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

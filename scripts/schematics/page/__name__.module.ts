import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedComponentsModule } from 'app/shared-components/shared-components.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { __className__Page } from './__fileName__.page';

const routes: Routes = [
  {
    path: '',
    component: __className__Page,
    data: {
      hideBackButton: true,
    },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    SharedComponentsModule,
    ScrollingModule,
  ],
  declarations: [__className__Page],
})
export class __className__Module {}

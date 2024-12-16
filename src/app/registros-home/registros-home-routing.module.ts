import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrosHomePage } from './registros-home.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrosHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrosHomePageRoutingModule {}

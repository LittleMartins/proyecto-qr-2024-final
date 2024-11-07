import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeDocentesPage } from './home-docentes.page';

const routes: Routes = [
  {
    path: '',
    component: HomeDocentesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeDocentesPageRoutingModule {}
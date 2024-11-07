import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAlumnosPage } from './home-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: HomeAlumnosPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeAlumnosPageRoutingModule {}

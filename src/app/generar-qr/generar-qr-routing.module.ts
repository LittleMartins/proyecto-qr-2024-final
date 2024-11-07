import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenerarQRPage } from './generar-qr.page';

const routes: Routes = [
  {
    path: '',
    component: GenerarQRPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerarQrPageRoutingModule {}

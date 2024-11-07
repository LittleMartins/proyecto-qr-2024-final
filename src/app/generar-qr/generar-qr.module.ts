import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GenerarQRPage } from './generar-qr.page';
import { GenerarQrPageRoutingModule } from './generar-qr-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerarQrPageRoutingModule
  ],
  declarations: [GenerarQRPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GenerarQrPageModule { }

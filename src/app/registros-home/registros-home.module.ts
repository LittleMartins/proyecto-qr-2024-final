import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrosHomePageRoutingModule } from './registros-home-routing.module';

import { RegistrosHomePage } from './registros-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrosHomePageRoutingModule
  ],
  declarations: [RegistrosHomePage]
})
export class RegistrosHomePageModule {}

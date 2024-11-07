import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeDocentesPageRoutingModule } from './home-docentes-routing.module';

import { HomeDocentesPage } from './home-docentes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HomeDocentesPageRoutingModule
  ],
  declarations: [HomeDocentesPage]
})
export class HomeDocentesPageModule {}

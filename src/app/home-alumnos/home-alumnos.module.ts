import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeAlumnosPageRoutingModule } from './home-alumnos-routing.module';
import { HomeAlumnosPage } from './home-alumnos.page';
import { provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HomeAlumnosPageRoutingModule,
  ],
  providers: [
    provideFirestore(() => getFirestore())
  ],
  declarations: [HomeAlumnosPage]
})
export class HomeAlumnosPageModule {}

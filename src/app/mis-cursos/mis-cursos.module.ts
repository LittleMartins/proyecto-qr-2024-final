import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MisCursosPageRoutingModule } from './mis-cursos-routing.module';
import { MisCursosPage } from './mis-cursos.page';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    MisCursosPageRoutingModule,
    NgCircleProgressModule.forRoot({
      // aquí puedes poner configuraciones por defecto
    })
  ],
  declarations: [MisCursosPage]
})
export class MisCursosPageModule {}

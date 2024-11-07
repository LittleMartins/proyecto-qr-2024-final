import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginAlumnoPageRoutingModule } from './login-alumno-routing.module';
import { LoginAlumnoPage } from './login-alumno.page';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginAlumnoPageRoutingModule,
    AngularFireAuthModule
  ],
  declarations: [LoginAlumnoPage],
  providers: [AuthService]
})
export class LoginAlumnoPageModule {}
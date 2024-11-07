import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home-alumnos',
  templateUrl: './home-alumnos.page.html',
  styleUrls: ['./home-alumnos.page.scss'],
})
export class HomeAlumnosPage implements OnInit {
  userData: any = {};
  nombreCompleto: string = '';
  isLoggingOut: boolean = false;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.firebaseService.getUserData(user.uid).subscribe({
          next: (doc: any) => {
            if (doc.exists) {
              this.userData = doc.data();
              this.nombreCompleto = `${this.userData.nombre || ''} ${this.userData.apellido || ''}`.trim();
            }
          },
          error: (error) => {
            console.error('Error al cargar datos:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async logout() {
    console.log('Intentando cerrar sesión...');
    this.isLoggingOut = true;
    try {
      await this.authService.logout();
      console.log('Sesión cerrada, mostrando animación por 3 segundos...');
      
      setTimeout(() => {
        this.navController.navigateRoot('/home');
      }, 3000);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.isLoggingOut = false;
    }
  }
}
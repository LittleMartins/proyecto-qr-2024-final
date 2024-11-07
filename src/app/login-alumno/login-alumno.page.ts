import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController, AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login-alumno',
  templateUrl: './login-alumno.page.html',
  styleUrls: ['./login-alumno.page.scss'],
})
export class LoginAlumnoPage {
  credentials = {
    email: '',
    password: ''
  };
  
  errorMessage: string = ''; // Añadida la propiedad errorMessage

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navController: NavController
  ) {}

  async login() {
    // Limpiar mensaje de error previo
    this.errorMessage = '';

    // Validaciones básicas
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('Intentando login con:', this.credentials.email);
      const result = await this.authService.loginWithEmail(
        this.credentials.email,
        this.credentials.password
      );
      
      console.log('Resultado del login:', result);
      await loading.dismiss();
      
      if (result.user) {
        console.log('Usuario autenticado, navegando a home-alumnos');
        await this.navController.navigateRoot('/home-alumnos');
      }
    } catch (error: any) {
      console.error('Error completo del login:', error);
      await loading.dismiss();

      // Manejar diferentes tipos de errores
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Demasiados intentos fallidos. Por favor, intenta más tarde';
          break;
        default:
          this.errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente';
      }

      const alert = await this.alertController.create({
        header: 'Error de inicio de sesión',
        message: this.errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
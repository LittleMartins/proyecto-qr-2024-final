import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-docente',
  templateUrl: './login-docente.page.html',
  styleUrls: ['./login-docente.page.scss'],
})
export class LoginDocentePage {
  credentials = {
    email: '',
    password: ''
  };
  
  errorMessage: string = '';

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navController: NavController,
    private router: Router
  ) {}

  async login() {
    this.errorMessage = '';

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
      
      if (result && result.user) {
        await loading.dismiss();
        if (this.credentials.email === 'ronald.villalobos@gmail.com') {
          console.log('Usuario autenticado, navegando a home-docentes');
          await this.router.navigate(['/home-docentes']);
        } else {
          this.errorMessage = 'Usuario no permitido, solo docentes';
          const alert = await this.alertController.create({
            header: 'Acceso denegado',
            message: this.errorMessage,
            buttons: ['OK']
          });
          await alert.present();
        }
      } else {
        console.error('No se pudo autenticar el usuario:', result);
        this.errorMessage = 'Error al autenticar el usuario';
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error completo del login:', error);

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

  async recoverPassword() {
    await this.navController.navigateForward('/recover-password');
  }
}
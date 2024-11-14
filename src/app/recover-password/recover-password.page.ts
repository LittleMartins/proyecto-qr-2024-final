import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage {
  email: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  async recoverPassword() {
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    try {
      await this.authService.recoverPassword(this.email);
      const alert = await this.alertController.create({
        header: 'Recuperación de Contraseña',
        message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      this.errorMessage = 'Hubo un error al enviar el correo de recuperación. Por favor, intenta nuevamente.';
    }
  }
}

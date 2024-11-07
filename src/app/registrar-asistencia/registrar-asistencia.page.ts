import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.page.html',
  styleUrls: ['./registrar-asistencia.page.scss'],
})
export class RegistrarAsistenciaPage {
  escanerActivo = false;
  scannerEnabled: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private platform: Platform
  ) {
    console.log('Página de escaneo inicializada');
  }

  async iniciarEscaneoQR() {
    try {
      console.log('Iniciando escaneo...');
      
      const permisos = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Permisos concedidos:', permisos);
      
      document.querySelector('body')?.classList.add('scanner-active');
      this.escanerActivo = true;
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        console.log('QR Content:', result.content);
        try {
          const qrData = JSON.parse(result.content);
          if (!qrData.id) {
            throw new Error('QR inválido: falta el ID de asistencia');
          }
          await this.registrarAsistencia(qrData);
        } catch (parseError) {
          await this.registrarAsistencia({ id: result.content });
        }
      }
    } catch (error) {
      console.error('Error al escanear:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.mostrarMensaje(`Error al escanear: ${errorMessage}`, 'error');
    } finally {
      this.detenerEscaneoQR();
    }
  }

  async detenerEscaneoQR() {
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.escanerActivo = false;
  }

  private async registrarAsistencia(qrData: any) {
    try {
      const userEmail = await this.authService.getUserEmail();
      if (!userEmail) throw new Error('Usuario no encontrado');

      const asistenciaRef = this.firestore.collection('asistencias').doc(qrData.id);
      const asistenciaDoc = await asistenciaRef.get().toPromise();

      if (!asistenciaDoc?.exists) {
        throw new Error('La asistencia no existe');
      }

      await asistenciaRef.update({
        [`asistentes.${userEmail.replace('.', ',')}`]: {
          estado: 'presente',
          timestamp: new Date().toISOString()
        }
      });

      await this.mostrarMensaje('Asistencia registrada correctamente', 'success');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al registrar la asistencia', 'error');
    }
  }

  private async mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    const alert = await this.alertController.create({
      header: tipo === 'success' ? 'Éxito' : 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}

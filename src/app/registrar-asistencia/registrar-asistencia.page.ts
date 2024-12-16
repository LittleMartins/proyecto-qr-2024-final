import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Platform, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

interface Asistencia {
  asignatura: string;
  fecha: Date;
  activo: boolean;
  asistentes: string[];
  codigoQR: string;
  duracion: number;
}

interface RegistroAsistencia {
  nombre: string;
  fecha: Date;
  estado: 'success' | 'error';
}

interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  rol?: string;
}

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.page.html',
  styleUrls: ['./registrar-asistencia.page.scss'],
})
export class RegistrarAsistenciaPage {
  escanerActivo: boolean = false;
  permisosCamara: boolean = false;
  userId: string | null = null;
  ultimosRegistros: RegistroAsistencia[] = [];

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.inicializarUsuario();
    this.cargarUltimosRegistros();
  }

  async inicializarUsuario() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.uid;
      this.cargarUltimosRegistros();
    }
  }

  cargarUltimosRegistros() {
    if (!this.userId) return;

    this.firestore
      .collection('asistencias', ref => 
        ref.where('asistentes', 'array-contains', this.userId)
           .limit(5)
      )
      .snapshotChanges()
      .pipe(
        map(docs => {
          return docs
            .map(doc => {
              const data = doc.payload.doc.data() as Asistencia;
              return {
                nombre: data.asignatura,
                fecha: data.fecha instanceof Date ? data.fecha : (data.fecha as Timestamp).toDate(),
                estado: 'success' as const
              };
            })
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
            .slice(0, 5);
        })
      )
      .subscribe(
        registros => {
          this.ultimosRegistros = registros;
        },
        error => {
          console.error('Error al cargar registros:', error);
          this.mostrarMensaje('Error al cargar los registros. Por favor, intenta más tarde.', 'danger');
        }
      );
  }

  async registrarAsistencia(asistenciaId: string) {
    try {
      if (!this.userId) {
        throw new Error('Usuario no autenticado');
      }

      const asistenciaRef = this.firestore.collection('asistencias').doc(asistenciaId);
      const doc = await asistenciaRef.get().toPromise();

      if (!doc?.exists) {
        throw new Error('Código QR inválido');
      }

      const asistencia = doc.data() as Asistencia;

      if (!asistencia.activo) {
        throw new Error('Este código QR ha expirado');
      }

      if (asistencia.asistentes?.includes(this.userId)) {
        throw new Error('Ya registraste tu asistencia');
      }

      // Actualizar asistentes y registrar timestamp
      await asistenciaRef.update({
        asistentes: [...(asistencia.asistentes || []), this.userId],
        [`registros.${this.userId}`]: new Date() // Guardamos el timestamp del registro
      });

      // El registro se actualizará automáticamente por el listener
      await this.mostrarMensaje('Asistencia registrada con éxito', 'success');

    } catch (error: any) {
      console.error('Error al registrar asistencia:', error);
      this.ultimosRegistros.unshift({
        nombre: 'Error de registro',
        fecha: new Date(),
        estado: 'error'
      });
      await this.mostrarMensaje(error.message || 'Error al registrar asistencia', 'danger');
    }
  }

  async iniciarEscaneoQR() {
    try {
      const permisos = await this.checkPermissions();
      if (!permisos) return;

      this.escanerActivo = true;
      document.querySelector('body')?.classList.add('scanner-active');
      await BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        await this.registrarAsistencia(result.content);
      }

    } catch (error) {
      console.error('Error al escanear:', error);
      await this.mostrarMensaje('Error al escanear el código QR', 'danger');
    } finally {
      await this.detenerEscaneoQR();
    }
  }

  async checkPermissions() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      return status.granted;
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      await this.mostrarMensaje('Error al verificar permisos de cámara', 'danger');
      return false;
    }
  }

  async detenerEscaneoQR() {
    try {
      this.escanerActivo = false;
      await BarcodeScanner.stopScan();
      await BarcodeScanner.showBackground();
      document.querySelector('body')?.classList.remove('scanner-active');
    } catch (error) {
      console.error('Error al detener escáner:', error);
    }
  }

  async mostrarMensaje(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  ngOnDestroy() {
    this.detenerEscaneoQR();
  }
}

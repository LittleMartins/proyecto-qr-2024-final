import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { toDataURL } from 'qrcode';
import { AuthService } from '../services/auth.service';

interface Asistencia {
  asignatura: string;
  fecha: string;
  hora: string;
  id: string;
  qrCode: string;
  tiempoLimite: number;
  alumno: string;
}

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQrPage implements OnInit {
  asignaturas = ['Arquitectura', 'Calidad de Software', 'Programación de Apps Móviles'];
  qrCode: string = '';
  selectedAsignatura: string = '';
  tiempoLimite: number = 120; // Duración en minutos
  asistencias: Asistencia[] = [];
  uniqueId: string = '';
  showCancellationAnimation: boolean = false;

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  ngOnInit() {
    this.cargarAsistencias();
  }

  async cargarAsistencias() {
    const asistenciasSnapshot = await this.firestore.collection<Asistencia>('asistencias').get().toPromise();
    if (!asistenciasSnapshot) {
      console.error('No se pudo obtener el snapshot de asistencias.');
      return;
    }
    this.asistencias = asistenciasSnapshot.docs.map(doc => {
      const data = doc.data();
      const { id, ...resto } = data;
      return { id: doc.id, ...resto } as Asistencia;
    });
  }

  async generateQrCode() {
    if (!this.selectedAsignatura) {
      alert('Por favor, selecciona una asignatura.');
      return;
    }

    const fecha = new Date();
    this.uniqueId = `${this.selectedAsignatura}-${fecha.getTime()}`;
    const alumno = await this.authService.getUserEmail() || 'Desconocido';
    const data: Asistencia = {
      asignatura: this.selectedAsignatura,
      fecha: fecha.toLocaleDateString(),
      hora: fecha.toLocaleTimeString(),
      id: this.uniqueId,
      qrCode: '',
      tiempoLimite: this.tiempoLimite * 60,
      alumno: alumno
    };

    data.qrCode = await toDataURL(JSON.stringify(data));
    this.qrCode = data.qrCode;

    await this.firestore.collection('asistencias').add(data);
    await this.firestore.collection('asistenciasGeneradas').add(data);

    this.cargarAsistencias();
  }

  async eliminarAsistencia(id: string) {
    if (id) {
      try {
        await this.firestore.collection('asistencias').doc(id).delete();
        this.cargarAsistencias();
      } catch (error) {
        console.error('Error al eliminar la asistencia:', error);
        alert('Hubo un problema al eliminar la asistencia. Inténtalo de nuevo.');
      }
    }
  }

  resetQr() {
    this.qrCode = '';
    this.selectedAsignatura = '';
  }

  showQrFullScreen(qrCode: string) {
    const qrContainer = document.createElement('div');
    qrContainer.style.position = 'fixed';
    qrContainer.style.top = '0';
    qrContainer.style.left = '0';
    qrContainer.style.width = '100%';
    qrContainer.style.height = '100%';
    qrContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    qrContainer.style.display = 'flex';
    qrContainer.style.alignItems = 'center';
    qrContainer.style.justifyContent = 'center';
    qrContainer.style.zIndex = '1000';

    const qrImage = document.createElement('img');
    qrImage.src = qrCode;
    qrImage.style.maxWidth = '90%';
    qrImage.style.maxHeight = '90%';
    qrImage.style.borderRadius = '10px';

    qrContainer.appendChild(qrImage);
    document.body.appendChild(qrContainer);

    qrContainer.addEventListener('click', () => {
      document.body.removeChild(qrContainer);
    });
  }
}

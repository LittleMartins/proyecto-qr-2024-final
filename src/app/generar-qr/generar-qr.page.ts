import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as QRCode from 'qrcode';
import { map } from 'rxjs/operators';

interface Asistencia {
  id?: string;
  asignatura: string;
  fecha: Date;
  codigoQR: string;
  duracion: number;
  activo: boolean;
}

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  asignaturas = [
    'Arquitectura',
    'Programación de Apps Móviles',
    'Calidad Software',
    'Estadística Descriptiva'
  ];
  
  asistencias: Asistencia[] = [];
  duracionSeleccionada: number = 5; // duración en minutos
  qrSeleccionado: string | null = null;
  asistenciaSeleccionada: Asistencia | null = null;
  
  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.cargarAsistencias();
  }

  async generarQR(asignatura: string) {
    const timestamp = new Date().getTime();
    const codigoUnico = `${asignatura}-${timestamp}`;
    
    try {
      const qrCode = await QRCode.toDataURL(codigoUnico);
      
      const nuevaAsistencia: Asistencia = {
        asignatura: asignatura,
        fecha: new Date(),
        codigoQR: qrCode,
        duracion: this.duracionSeleccionada,
        activo: true
      };

      // Guardar en Firestore
      await this.firestore.collection('asistencias').add(nuevaAsistencia);
      
      // Iniciar temporizador
      setTimeout(() => {
        this.desactivarQR(codigoUnico);
      }, this.duracionSeleccionada * 60 * 1000);

      this.cargarAsistencias();
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  }

  async desactivarQR(codigoQR: string) {
    const querySnapshot = await this.firestore.collection('asistencias')
      .ref.where('codigoQR', '==', codigoQR).get();
    
    querySnapshot.forEach((doc) => {
      doc.ref.update({ activo: false });
    });
  }

  async eliminarAsistencia(id: string) {
    try {
      await this.firestore.collection('asistencias').doc(id).delete();
      this.cargarAsistencias();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }

  cargarAsistencias() {
    this.firestore.collection('asistencias')
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.asistencias = data;
      });
  }

  mostrarQRCompleto(asistencia: Asistencia) {
    this.qrSeleccionado = asistencia.codigoQR;
    this.asistenciaSeleccionada = asistencia;
  }

  cerrarQRCompleto() {
    this.qrSeleccionado = null;
    this.asistenciaSeleccionada = null;
  }
}


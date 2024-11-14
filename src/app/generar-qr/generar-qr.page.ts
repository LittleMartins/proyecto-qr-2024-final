import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as QRCode from 'qrcode';
import { map } from 'rxjs/operators';

interface Asistencia {
  id?: string;
  asignatura: string;
  fecha: Date;
  codigoQR?: string;
  duracion: number;
  activo: boolean;
  asistentes: string[];
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
  duracionSeleccionada: number = 120; // duración en minutos
  qrSeleccionado: string | null = null;
  asistenciaSeleccionada: Asistencia | null = null;
  
  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.cargarAsistencias();
  }

  async generarQR(asignatura: string) {
    try {
      // Primero crear el documento en Firestore
      const nuevaAsistencia: Omit<Asistencia, 'codigoQR'> = {
        asignatura: asignatura,
        fecha: new Date(),
        duracion: this.duracionSeleccionada,
        activo: true,
        asistentes: [] // Agregamos el array de asistentes
      };

      // Guardar en Firestore y obtener el ID del documento
      const docRef = await this.firestore.collection('asistencias').add(nuevaAsistencia);
      const docId = docRef.id;

      // Generar QR con el ID del documento
      const qrCode = await QRCode.toDataURL(docId, {
        width: 400,
        margin: 2,
        scale: 4,
        errorCorrectionLevel: 'H'
      });
      
      // Actualizar el documento con el código QR
      await docRef.update({
        codigoQR: qrCode
      });
      
      // Iniciar temporizador
      setTimeout(() => {
        this.desactivarQR(docId);
      }, this.duracionSeleccionada * 60 * 1000);

      this.cargarAsistencias();
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  }

  async desactivarQR(docId: string) {
    try {
      await this.firestore.collection('asistencias').doc(docId).update({ 
        activo: false 
      });
    } catch (error) {
      console.error('Error al desactivar QR:', error);
    }
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
    this.qrSeleccionado = asistencia.codigoQR || null;
    this.asistenciaSeleccionada = asistencia;
  }

  cerrarQRCompleto() {
    this.qrSeleccionado = null;
    this.asistenciaSeleccionada = null;
  }
}


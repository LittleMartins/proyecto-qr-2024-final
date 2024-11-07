import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { AlertController, ToastController } from '@ionic/angular';

interface Usuario {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  profileImage: string;
}

interface Asistencia {
  id?: string;
  asignatura: string;
  fecha: firebase.firestore.Timestamp;
  codigoQR: string;
  activo: boolean;
  asistentes?: string[];
}

interface AsistenciaConUsuarios extends Omit<Asistencia, 'asistentes' | 'fecha'> {
  asistentes: (Usuario & { registrado: boolean })[];
  fecha: Date;
}

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage implements OnInit {
  asistencias$: Observable<AsistenciaConUsuarios[]>;
  asistenciaSeleccionada: string | null = null;
  asistenciaActual$ = new BehaviorSubject<AsistenciaConUsuarios | null>(null);
  filtroEstado$ = new BehaviorSubject<'todos' | 'activos' | 'finalizados'>('todos');

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.asistencias$ = this.obtenerAsistenciasFiltradas();
  }

  ngOnInit() {}

  private obtenerAsistenciasConUsuarios(): Observable<AsistenciaConUsuarios[]> {
    const asistencias$ = this.firestore.collection<Asistencia>('asistencias')
      .valueChanges({ idField: 'id' });
    
    const usuarios$ = this.firestore.collection<Usuario>('users')
      .valueChanges({ idField: 'uid' });

    return combineLatest([asistencias$, usuarios$]).pipe(
      map(([asistencias, usuarios]) => {
        return asistencias.map(asistencia => {
          const asistentes = usuarios.map(usuario => ({
            ...usuario,
            registrado: asistencia.asistentes?.includes(usuario.uid) || false
          }));

          return {
            ...asistencia,
            asistentes,
            fecha: asistencia.fecha.toDate() // Convertir Timestamp a Date
          };
        });
      })
    );
  }

  private obtenerAsistenciasFiltradas(): Observable<AsistenciaConUsuarios[]> {
    return combineLatest([
      this.obtenerAsistenciasConUsuarios(),
      this.filtroEstado$
    ]).pipe(
      map(([asistencias, estado]) => {
        return asistencias
          .filter(asistencia => {
            if (estado === 'todos') return true;
            return estado === 'activos' ? asistencia.activo : !asistencia.activo;
          })
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      })
    );
  }

  seleccionarAsistencia(event: any) {
    const asistenciaId = event.detail.value;
    if (asistenciaId) {
      this.asistencias$.pipe(
        map(asistencias => asistencias.find(asistencia => asistencia.id === asistenciaId))
      ).subscribe(asistencia => {
        if (asistencia) {
          this.asistenciaActual$.next(asistencia);
        }
      });
    }
  }

  cambiarFiltroEstado(event: any) {
    this.filtroEstado$.next(event.detail.value);
  }

  async editarAsistencia(asistenciaId: string, alumnoUid: string, registrado: boolean) {
    const alert = await this.alertController.create({
      header: 'Editar Asistencia',
      message: `¿Desea marcar al alumno como ${registrado ? 'Ausente' : 'Presente'}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              const asistenciaRef = this.firestore.collection('asistencias').doc(asistenciaId);
              const asistenciaDoc = await asistenciaRef.get().toPromise();
              
              if (asistenciaDoc?.exists) {
                const data = asistenciaDoc.data() as Asistencia;
                let asistentes = data.asistentes || [];

                if (registrado) {
                  // Si está presente, lo removemos
                  asistentes = asistentes.filter(uid => uid !== alumnoUid);
                } else {
                  // Si está ausente, lo agregamos
                  if (!asistentes.includes(alumnoUid)) {
                    asistentes.push(alumnoUid);
                  }
                }

                await asistenciaRef.update({ asistentes });
                this.mostrarMensaje('Asistencia actualizada correctamente');
              }
            } catch (error) {
              console.error('Error al actualizar asistencia:', error);
              this.mostrarMensaje('Error al actualizar la asistencia', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async finalizarAsistencia(asistenciaId?: string) {
    if (!asistenciaId) return;
    
    const alert = await this.alertController.create({
      header: 'Finalizar Asistencia',
      message: '¿Está seguro que desea finalizar esta asistencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.firestore.collection('asistencias').doc(asistenciaId).update({
                activo: false
              });
              this.mostrarMensaje('Asistencia finalizada correctamente');
            } catch (error) {
              console.error('Error al finalizar asistencia:', error);
              this.mostrarMensaje('Error al finalizar la asistencia', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarMensaje(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

interface Actividad {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: any;
  estado: 'pendiente' | 'completada';
}

interface Anuncio {
  titulo: string;
  mensaje: string;
  fecha: Date;
}

interface Notificacion {
  titulo: string;
  mensaje: string;
  fecha: Date;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-home-alumnos',
  templateUrl: './home-alumnos.page.html',
  styleUrls: ['./home-alumnos.page.scss'],
})
export class HomeAlumnosPage implements OnInit {
  userData: any = {};
  nombreCompleto: string = '';
  userAvatar: string = '';
  asistenciasCount: number = 0;
  cursosCount: number = 0;
  porcentajeAsistencia: number = 0;
  proximaClase: string = '';
  actividades$: Observable<Actividad[]>;
  actividadesFiltradas$: Observable<Actividad[]>;
  filtroActual: string = 'todas';
  terminoBusqueda: string = '';
  anuncios: Anuncio[] = [
    {
      titulo: 'Suspensión de clases',
      mensaje: 'Las clases se suspenden el día viernes por jornada de capacitación',
      fecha: new Date()
    },
    {
      titulo: 'Recordatorio evaluación',
      mensaje: 'Evaluación de matemáticas programada para la próxima semana',
      fecha: new Date()
    }
  ];
  notificaciones: Notificacion[] = [
    {
      titulo: 'Clase cancelada',
      mensaje: 'La clase de matemáticas de hoy ha sido cancelada',
      fecha: new Date(),
      icono: 'alert-circle',
      color: 'danger'
    },
    {
      titulo: 'Tarea entregada',
      mensaje: 'Tu tarea de programación ha sido recibida',
      fecha: new Date(),
      icono: 'checkmark-circle',
      color: 'success'
    }
  ];

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private navController: NavController,
    private loadingController: LoadingController,
    private firestore: AngularFirestore,
    private toastController: ToastController
  ) {
    this.actividades$ = this.firestore.collection<Actividad>('actividades', ref => 
      ref.orderBy('fecha', 'asc')
    ).valueChanges({ idField: 'id' });
    
    this.actividadesFiltradas$ = this.actividades$;
    this.cargarPorcentajeAsistencia();
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      const user = await this.firebaseService.getCurrentUser();
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
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.logout();
      await loading.dismiss();
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await loading.dismiss();
    }
  }

  buscarActividades(event: any) {
    const texto = event.detail.value.toLowerCase();
    this.terminoBusqueda = texto;
    
    this.actividadesFiltradas$ = this.actividades$.pipe(
      map(actividades => {
        return actividades.filter(actividad => {
          const coincideTexto = actividad.titulo.toLowerCase().includes(texto) ||
                               actividad.descripcion.toLowerCase().includes(texto);
          return this.aplicarFiltro(actividad) && coincideTexto;
        });
      })
    );
  }

  filtrarActividades(event: any) {
    const filtro = event.detail.value;
    this.filtroActual = filtro;
    
    this.actividadesFiltradas$ = this.actividades$.pipe(
      map(actividades => {
        return actividades.filter(actividad => {
          const coincideTexto = actividad.titulo.toLowerCase().includes(this.terminoBusqueda) ||
                               actividad.descripcion.toLowerCase().includes(this.terminoBusqueda);
          return this.aplicarFiltro(actividad) && coincideTexto;
        });
      })
    );
  }

  private aplicarFiltro(actividad: Actividad): boolean {
    switch (this.filtroActual) {
      case 'pendientes':
        return actividad.estado === 'pendiente';
      case 'completadas':
        return actividad.estado === 'completada';
      default:
        return true;
    }
  }

  async cambiarEstado(actividad: Actividad) {
    try {
      const nuevoEstado = actividad.estado === 'pendiente' ? 'completada' : 'pendiente';
      
      // Buscar el documento por título
      const actividadesSnapshot = await this.firestore
        .collection<Actividad>('actividades', ref => ref.where('titulo', '==', actividad.titulo))
        .get()
        .toPromise();

      if (!actividadesSnapshot || actividadesSnapshot.empty) {
        throw new Error('No se encontró la actividad');
      }

      // Actualizar el estado
      const actividadRef = actividadesSnapshot.docs[0].ref;
      await actividadRef.update({ estado: nuevoEstado });

      // Mostrar mensaje de éxito
      const toast = await this.toastController.create({
        message: `Actividad marcada como ${nuevoEstado}`,
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
      
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const toast = await this.toastController.create({
        message: 'Error al cambiar el estado de la actividad',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    }
  }

  private async cargarPorcentajeAsistencia() {
    try {
      const user = await this.firebaseService.getCurrentUser();
      if (user) {
        // Aquí deberías obtener el porcentaje real desde tu base de datos
        // Este es solo un ejemplo
        this.firestore
          .collection('asistencias')
          .doc(user.uid)
          .valueChanges()
          .subscribe((data: any) => {
            this.porcentajeAsistencia = data?.porcentaje || 85; // valor por defecto 85%
          });
      }
    } catch (error) {
      console.error('Error al cargar porcentaje de asistencia:', error);
      this.porcentajeAsistencia = 0;
    }
  }
}
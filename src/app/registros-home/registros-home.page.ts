import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, forkJoin } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';

interface UserData {
  nombre: string;
  apellido: string;
  email: string;
  phone: string;
  profileImage: string | null;
  uid: string;
  fechaActualizacion?: Date;
}

interface RegistroCompletado {
  userId: string;
  nombreUsuario: string;
  fecha: Date;
  estado: 'completada' | 'pendiente';
  userData?: UserData;
}

interface Actividad {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: any;
  estado: 'pendiente' | 'completada';
  registros?: {
    [userId: string]: {
      nombreUsuario: string;
      fecha: Date | Timestamp;
      estado: 'completada' | 'pendiente';
      userId: string;
    }
  };
}

interface ActividadInfo {
  fecha: Date | Timestamp;
  titulo: string;
  descripcion: string;
  // ... otros campos
}

@Component({
  selector: 'app-registros-home',
  templateUrl: './registros-home.page.html',
  styleUrls: ['./registros-home.page.scss']
})
export class RegistrosHomePage implements OnInit {
  registros: any[] = [];
  actividadId: string | null;
  actividadInfo!: Actividad;
  totalRegistros: number = 0;
  completados: number = 0;
  pendientes: number = 0;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {
    this.actividadId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.actividadId = params['actividadId'];
      if (this.actividadId) {
        this.cargarDatosActividad();
      }
    });
  }

  private cargarDatosActividad() {
    const actividadRef = this.firestore.doc<Actividad>(`actividades/${this.actividadId}`);
    
    actividadRef.valueChanges().subscribe(async actividad => {
      if (!actividad) {
        console.log('No se encontró la actividad');
        return;
      }
      
      this.actividadInfo = actividad;
      console.log('Actividad encontrada:', actividad);
      
      if (actividad.registros) {
        try {
          const registrosPromises = Object.entries(actividad.registros).map(async ([userId, registro]) => {
            console.log('Procesando usuario:', userId);
            
            const userDoc = await this.firestore.doc(`users/${userId}`).get().toPromise();
            const userInfo = userDoc?.data() as UserData;
            
            console.log('Datos del usuario encontrados:', userInfo);

            return {
              userId,
              nombreUsuario: registro.nombreUsuario,
              fecha: registro.fecha instanceof Date ? registro.fecha : (registro.fecha as Timestamp).toDate(),
              estado: registro.estado,
              userData: {
                nombre: userInfo?.nombre || 'Sin nombre',
                apellido: userInfo?.apellido || 'Sin apellido',
                email: userInfo?.email || 'Sin email',
                phone: userInfo?.phone || 'Sin teléfono',
                profileImage: userInfo?.profileImage || null,
                uid: userId
              }
            };
          });

          this.registros = await Promise.all(registrosPromises);
          console.log('Registros procesados:', this.registros);
          
          this.totalRegistros = this.registros.length;
          this.completados = this.registros.filter(r => r.estado === 'completada').length;
          this.pendientes = this.registros.filter(r => r.estado === 'pendiente').length;
        } catch (error) {
          console.error('Error al procesar registros:', error);
        }
      } else {
        console.log('No hay registros en esta actividad');
        this.registros = [];
        this.totalRegistros = 0;
        this.completados = 0;
        this.pendientes = 0;
      }
    });
  }

  getProfileImageSrc(profileImage: string | null | undefined): string {
    // Verificar si hay una imagen
    if (!profileImage) {
      return 'assets/default-avatar.png';
    }

    // Verificar si es una imagen base64 válida
    if (profileImage.startsWith('data:image')) {
      return profileImage;
    }

    // Si no es base64 ni una URL válida, retornar imagen por defecto
    return 'assets/default-avatar.png';
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-avatar.png';
    }
  }

  private async processRegistros(registrosData: any): Promise<RegistroCompletado[]> {
    const registrosProcesados = [];
    
    for (const registro of registrosData) {
      const actividadDoc = await this.firestore.collection('actividades').doc(registro.actividadId).get().toPromise();
      if (!actividadDoc || !actividadDoc.exists) {
        console.error('No se encontró el documento de actividad');
        continue; // O maneja el error de otra manera
      }
      const actividadData = actividadDoc.data() as ActividadInfo;
      
      if (actividadData?.fecha instanceof Timestamp) {
        actividadData.fecha = actividadData.fecha.toDate();
      }
      
      try {
        // Añadir tipo para registro
        const registroTyped = registro as {
          nombreUsuario: string;
          fecha: Timestamp;
          estado: 'completada' | 'pendiente';
        };

        const userDoc = await this.firestore
          .collection('users')
          .doc(registro.userId)
          .get()
          .toPromise();
        
        const userData = userDoc?.data() as UserData;
        
        registrosProcesados.push({
          userId: registro.userId,
          nombreUsuario: registroTyped.nombreUsuario,
          fecha: registroTyped.fecha?.toDate() || new Date(),
          estado: registroTyped.estado,
          userData: userData
        });
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    }
    
    return registrosProcesados;
  }
}

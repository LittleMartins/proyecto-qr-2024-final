import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';

interface Actividad {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: any; // Timestamp
  estado: 'pendiente' | 'completada';
}

@Component({
  selector: 'app-home-docentes',
  templateUrl: './home-docentes.page.html',
  styleUrls: ['./home-docentes.page.scss'],
})
export class HomeDocentesPage implements OnInit {
  currentDate: Date;
  actividades$: Observable<Actividad[]> = new Observable<Actividad[]>();
  nuevaActividadForm: FormGroup;
  isEditing: boolean = false; // Variable para controlar el estado de edición
  userData: any = {}; // Variable para almacenar los datos del usuario
  nombreCompleto: string = ''; // Variable para almacenar el nombre completo

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private firebaseService: FirebaseService
  ) {
    this.currentDate = new Date();
    this.nuevaActividadForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: ['', Validators.required],
      estado: ['pendiente']
    });
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


  ngOnInit() {
    this.loadActividades();
    this.loadUserData();
  }

  loadActividades() {
    this.actividades$ = this.firestore.collection<Actividad>('actividades').valueChanges({ idField: 'id' });
  }

  logout() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }

  async agregarActividad() {
    if (this.nuevaActividadForm.valid) {
      const nuevaActividad: Actividad = {
        titulo: this.nuevaActividadForm.value.titulo,
        descripcion: this.nuevaActividadForm.value.descripcion,
        fecha: this.nuevaActividadForm.value.fecha,
        estado: this.nuevaActividadForm.value.estado
      };

      // Agregar nueva actividad
      await this.firestore.collection('actividades').add(nuevaActividad);
      this.presentToast('Actividad agregada con éxito.');

      this.resetForm(); // Resetear el formulario
    } else {
      this.presentToast('Por favor, completa todos los campos obligatorios.');
    }
  }

  async eliminarActividad(actividad: Actividad) {
    if (actividad && actividad.id) {
      await this.firestore.collection('actividades').doc(actividad.id).delete();
      this.presentToast('Actividad eliminada con éxito.');
      this.loadActividades(); // Recargar actividades
    } else {
      this.presentToast('No se pudo eliminar la actividad. ID no válido.');
    }
  }

  async marcarComoCompletada(actividad: Actividad) {
    if (actividad.id) {
      await this.firestore.collection('actividades').doc(actividad.id).update({ estado: 'completada' });
      this.presentToast('Actividad marcada como completada.');
      this.loadActividades(); // Recargar actividades
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  async actualizarActividad(actividad: Actividad) {
    if (actividad && actividad.id) {
      this.nuevaActividadForm.setValue({
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        fecha: actividad.fecha,
        estado: actividad.estado
      });
      this.nuevaActividadForm.patchValue({ id: actividad.id }); // Asegúrate de que el ID se esté estableciendo
      this.isEditing = true; // Cambiar a modo edición
    } else {
      this.presentToast('No se pudo cargar la actividad para editar. ID no válido.');
    }
  }

  async guardarActividad() {
    try {
      const updatedActividad: Actividad = {
        titulo: this.nuevaActividadForm.value.titulo,
        descripcion: this.nuevaActividadForm.value.descripcion,
        fecha: this.nuevaActividadForm.value.fecha,
        estado: this.nuevaActividadForm.value.estado
      };

      // Verificar que el título esté presente
      if (!updatedActividad.titulo) {
        throw new Error('El título no puede estar vacío');
      }

      // Buscar el documento por título
      const actividadesSnapshot = await this.firestore.collection<Actividad>('actividades', ref => ref.where('titulo', '==', updatedActividad.titulo)).get().toPromise();

      // Verificar si actividadesSnapshot es undefined
      if (!actividadesSnapshot || actividadesSnapshot.empty) {
        throw new Error('No se encontró ninguna actividad con ese título');
      }

      // Actualizar el primer documento encontrado
      const actividadRef = actividadesSnapshot.docs[0].ref;
      await actividadRef.update(updatedActividad);

      await this.presentToast('Actividad actualizada correctamente.');
      this.resetForm(); // Resetear el formulario
    } catch (error: any) {
      console.error('Error al guardar la actividad:', error);
      await this.presentToast('Error al guardar la actividad: ' + error.message);
    }
  }

  resetForm() {
    this.nuevaActividadForm.reset();
    this.isEditing = false; // Volver a modo agregar
    this.loadActividades(); // Recargar actividades
  }
}

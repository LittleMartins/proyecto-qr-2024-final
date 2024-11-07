import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-test-firebase',
  templateUrl: './test-firebase.page.html',
  styleUrls: ['./test-firebase.page.scss'],
})
export class TestFirebasePage implements OnInit {
  items: any[] = [];
  nuevoItem = {
    titulo: '',
    descripcion: ''
  };

  constructor(
    private firebaseService: FirebaseService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.firebaseService.obtenerDocumentos().subscribe(data => {
      this.items = data;
      console.log('Datos cargados:', data);
    }, error => {
      console.error('Error al cargar datos:', error);
      this.mostrarMensaje('Error al cargar los datos');
    });
  }

  async agregarItem() {
    if (this.nuevoItem.titulo && this.nuevoItem.descripcion) {
      try {
        await this.firebaseService.crearDocumento(this.nuevoItem);
        this.mostrarMensaje('Item agregado correctamente');
        this.nuevoItem = {
          titulo: '',
          descripcion: ''
        };
      } catch (error) {
        console.error('Error:', error);
        this.mostrarMensaje('Error al agregar el item');
      }
    } else {
      this.mostrarMensaje('Por favor completa todos los campos');
    }
  }

  async eliminarItem(id: string) {
    try {
      await this.firebaseService.eliminarDocumento(id);
      this.mostrarMensaje('Item eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al eliminar el item');
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
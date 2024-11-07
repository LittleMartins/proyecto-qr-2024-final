import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-mis-cursos',
  templateUrl: './mis-cursos.page.html',
  styleUrls: ['./mis-cursos.page.scss'],
})
export class MisCursosPage {
  cursos = ['apps', 'arquitectura', 'estadistica', 'calidad'];
  asistenciaTotal = 85;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  async irARegistrarAsistencia() {
    console.log('Intentando navegar a registrar-asistencia');
    try {
      const result = await this.router.navigate(['/registrar-asistencia'], {
        skipLocationChange: false,
        replaceUrl: false
      });
      console.log('Resultado de la navegación:', result);
    } catch (error) {
      console.error('Error en la navegación:', error);
    }
  }

  verDetallesCurso(curso: string) {
    this.alertController.create({
      header: 'Detalles del Curso',
      message: `Detalles del curso: ${curso}`,
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}

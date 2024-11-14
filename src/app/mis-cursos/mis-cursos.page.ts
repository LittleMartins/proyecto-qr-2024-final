import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

interface Asistencia {
  asignatura: string;
  fecha: any;
  activo: boolean;
  asistentes: string[];
  codigoQR: string;
}

@Component({
  selector: 'app-mis-cursos',
  templateUrl: './mis-cursos.page.html',
  styleUrls: ['./mis-cursos.page.scss'],
})
export class MisCursosPage implements OnInit {
  cursos = ['apps', 'arquitectura', 'estadistica', 'calidad'];
  asistenciaTotal = 0;
  asistenciasPorCurso: { [key: string]: number } = {};
  totalClasesPorCurso: { [key: string]: number } = {};
  userId: string = 'KOyYOzDtBob6H4m18INiUkR2HKr2';
  asistenciasPorAsignatura: { [key: string]: Asistencia[] } = {};

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.cargarAsistencias();
  }

  cargarAsistencias() {
    this.firestore.collection<Asistencia>('asistencias')
      .valueChanges()
      .subscribe(asistencias => {
        // Reiniciar contadores
        this.asistenciasPorCurso = {};
        this.totalClasesPorCurso = {};
        this.asistenciasPorAsignatura = {};

        // Agrupar asistencias por asignatura usando el código corto
        asistencias.forEach(asistencia => {
          const codigoCurso = this.obtenerCodigoCurso(asistencia.asignatura);
          
          // Removemos la verificación de activo
          if (!this.asistenciasPorAsignatura[codigoCurso]) {
            this.asistenciasPorAsignatura[codigoCurso] = [];
          }
          this.asistenciasPorAsignatura[codigoCurso].push(asistencia);

          // Contar total de clases
          this.totalClasesPorCurso[codigoCurso] = 
            (this.totalClasesPorCurso[codigoCurso] || 0) + 1;

          // Contar asistencias del usuario
          if (asistencia.asistentes?.includes(this.userId)) {
            this.asistenciasPorCurso[codigoCurso] = 
              (this.asistenciasPorCurso[codigoCurso] || 0) + 1;
          }
        });

        // Calcular asistencia total
        let totalAsistencias = 0;
        let totalClases = 0;
        Object.keys(this.totalClasesPorCurso).forEach(curso => {
          totalAsistencias += this.asistenciasPorCurso[curso] || 0;
          totalClases += this.totalClasesPorCurso[curso];
        });
        this.asistenciaTotal = totalClases > 0 ? Math.round((totalAsistencias / totalClases) * 100) : 0;
      });
  }

  async verDetallesCurso(curso: string) {
    const asistenciasCurso = this.asistenciasPorAsignatura[curso] || [];
    const nombreCursoCompleto = this.obtenerNombreCompletoCurso(curso as 'apps' | 'arquitectura' | 'estadistica' | 'calidad');

    const alert = await this.alertController.create({
      header: nombreCursoCompleto,
      message: this.generarMensajeAsistencias(asistenciasCurso),
      buttons: ['OK']
    });

    await alert.present();
  }

  private generarMensajeAsistencias(asistencias: Asistencia[]): string {
    if (!asistencias || asistencias.length === 0) {
      return 'No hay registros de asistencia para este curso.';
    }

    // Calcular total de asistencias del usuario
    const asistenciasUsuario = asistencias.filter(a => 
      a.asistentes?.includes(this.userId)).length;

    // Crear resumen
    let mensaje = `Total de clases: ${asistencias.length}\n`;
    mensaje += `Asistencias: ${asistenciasUsuario}\n`;
    mensaje += `Porcentaje: ${Math.round((asistenciasUsuario / asistencias.length) * 100)}%\n\n`;
    mensaje += 'Detalle por clase:\n';
    
    // Agregar detalle de cada clase
    mensaje += asistencias
      .sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime())
      .map(asistencia => {
        const fecha = asistencia.fecha.toDate().toLocaleDateString();
        const estado = asistencia.asistentes?.includes(this.userId) ? 
          '✅ Presente' : '❌ Ausente';
        return `${fecha}: ${estado}`;
      })
      .join('\n');

    return mensaje;
  }

  private obtenerNombreCompletoCurso(codigo: 'apps' | 'arquitectura' | 'estadistica' | 'calidad'): string {
    const nombres = {
      'apps': 'Programación de Apps Móviles',
      'arquitectura': 'Arquitectura',
      'estadistica': 'Estadística Descriptiva',
      'calidad': 'Calidad Software'
    };
    return nombres[codigo] || codigo;
  }

  async irARegistrarAsistencia() {
    await this.router.navigate(['/registrar-asistencia']);
  }

  private obtenerCodigoCurso(nombreCompleto: string): string {
    switch (nombreCompleto) {
      case 'Programación de Apps Móviles':
        return 'apps';
      case 'Arquitectura':
        return 'arquitectura';
      case 'Estadística Descriptiva':
        return 'estadistica';
      case 'Calidad Software':
        return 'calidad';
      default:
        return nombreCompleto;
    }
  }

  calcularPorcentajePorCurso(curso: string): number {
    const asistencias = this.asistenciasPorCurso[curso] || 0;
    const total = this.totalClasesPorCurso[curso] || 0;
    return total > 0 ? Math.round((asistencias / total) * 100) : 0;
  }
}

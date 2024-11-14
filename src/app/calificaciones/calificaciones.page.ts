import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';

interface Calificacion {
  uid: string;
  parcial1: number;
  parcial2: number;
  parcial3: number;
  examen: number;
  promedio: number;
  fechaActualizacion: Date;
}

@Component({
  selector: 'app-calificaciones',
  templateUrl: './calificaciones.page.html',
  styleUrls: ['./calificaciones.page.scss'],
})
export class CalificacionesPage implements OnInit {
  calificaciones$: Observable<Calificacion | null>;
  promedioGeneral: number = 0;
  loading: boolean = true;
  userId: string = '';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.calificaciones$ = new Observable();
  }

  async ngOnInit() {
    this.userId = await this.authService.getUserId();
    this.cargarCalificaciones();
  }

  cargarCalificaciones() {
    this.calificaciones$ = this.firestore
      .collection('calificaciones')
      .doc<Calificacion>(this.userId)
      .valueChanges()
      .pipe(
        map(calificaciones => {
          if (calificaciones) {
            this.calcularPromedioGeneral(calificaciones);
            return calificaciones;
          }
          return null;
        })
      );
  }

  calcularPromedioGeneral(calificaciones: Calificacion) {
    const notas = [
      calificaciones.parcial1,
      calificaciones.parcial2,
      calificaciones.parcial3,
      calificaciones.examen
    ].filter(nota => nota > 0); // Solo considerar notas mayores a 0

    if (notas.length > 0) {
      const suma = notas.reduce((a, b) => a + b, 0);
      this.promedioGeneral = Number((suma / notas.length).toFixed(1));
    } else {
      this.promedioGeneral = 0;
    }
  }

  getColorNota(nota: number): string {
    if (nota >= 6.0) return 'success';
    if (nota >= 5.0) return 'warning';
    return 'danger';
  }
}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Clase {
  asignatura: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  sala: string;
  profesor: string;
}

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit {
  diaActual: string;
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  horarioClases: Clase[] = [
    {
      asignatura: 'Arquitectura',
      dia: 'Lunes',
      horaInicio: '08:30',
      horaFin: '10:00',
      sala: 'Lab 301',
      profesor: 'Vicente Chacón'
    },
    {
      asignatura: 'Programación de Apps Móviles',
      dia: 'Lunes',
      horaInicio: '10:15',
      horaFin: '11:45',
      sala: 'Lab 302',
      profesor: 'Ronald Villalobos'
    },
    {
      asignatura: 'Programación de Apps Móviles',
      dia: 'Miércoles',
      horaInicio: '10:15',
      horaFin: '11:45',
      sala: 'Lab 302',
      profesor: 'Ronald Villalobos'
    },
    {
      asignatura: 'Calidad Software',
      dia: 'Martes',
      horaInicio: '14:30',
      horaFin: '16:00',
      sala: 'Sala 201',
      profesor: 'Cindy Betsabé'
    },
    {
      asignatura: 'Calidad Software',
      dia: 'Jueves',
      horaInicio: '14:30',
      horaFin: '16:00',
      sala: 'Sala 201',
      profesor: 'Cindy Betsabé'
    },
    {
      asignatura: 'Estadística Descriptiva',
      dia: 'Miércoles',
      horaInicio: '11:00',
      horaFin: '12:30',
      sala: 'Sala 205',
      profesor: 'Christian Calderón'
    },
    {
      asignatura: 'Estadística Descriptiva',
      dia: 'Viernes',
      horaInicio: '11:00',
      horaFin: '12:30',
      sala: 'Sala 205',
      profesor: 'Christian Calderón'
    }
  ];

  constructor() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoy = new Date();
    this.diaActual = dias[hoy.getDay()];
    if (!this.diasSemana.includes(this.diaActual)) {
      this.diaActual = 'Lunes';
    }
  }

  ngOnInit() { }

  getClasesPorDia(dia: string): Clase[] {
    return this.horarioClases
      .filter(clase => clase.dia === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  cambiarDia(event: any) {
    this.diaActual = event.detail.value;
  }

  esDiaActual(dia: string): boolean {
    return this.diaActual === dia;
  }
}

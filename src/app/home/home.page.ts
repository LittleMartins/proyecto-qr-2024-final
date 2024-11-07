import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  irALoginAlumno() {
    this.router.navigate(['/login-alumno']);
  }

  irALoginProfesor() {
    this.router.navigate(['/login-docente']);
  }
}

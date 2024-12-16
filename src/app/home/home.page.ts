import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private http: HttpClient, private router: Router) {}

  descargarAPK() {
    const nombreArchivo = 'RegistraApp.apk';
    this.http.get(`assets/${nombreArchivo}`, { responseType: 'blob' })
      .subscribe(
        (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = nombreArchivo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Error al descargar el archivo');
        }
      );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login-alumno',
    loadChildren: () => import('./login-alumno/login-alumno.module').then(m => m.LoginAlumnoPageModule)
  },
  {
    path: 'home-alumnos',
    loadChildren: () => import('./home-alumnos/home-alumnos.module').then(m => m.HomeAlumnosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mis-cursos',
    loadChildren: () => import('./mis-cursos/mis-cursos.module').then(m => m.MisCursosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'registrar-asistencia',
    loadChildren: () => import('./registrar-asistencia/registrar-asistencia.module').then(m => m.RegistrarAsistenciaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mi-perfil',
    loadChildren: () => import('./mi-perfil/mi-perfil.module').then(m => m.MiPerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login-docente',
    loadChildren: () => import('./login-docente/login-docente.module').then(m => m.LoginDocentePageModule)
  },
  {
    path: 'home-docentes',
    loadChildren: () => import('./home-docentes/home-docentes.module').then(m => m.HomeDocentesPageModule)
  },
  
  {
    path: 'generar-qr',
    loadChildren: () => import('./generar-qr/generar-qr.module').then( m => m.GenerarQrPageModule)
  },

  {
    path: 'asistencias',
    loadChildren: () => import('./asistencias/asistencias.module').then( m => m.AsistenciasPageModule)
  },

  {
    path: '**',  // Ruta wildcard para capturar navegaciones no válidas
    redirectTo: 'home'
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: false  // Cambiado a false para reducir los logs
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

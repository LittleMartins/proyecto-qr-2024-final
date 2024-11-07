import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async loginWithEmail(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Usuario autenticado:', result.user);
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user),
      tap(auth => {
        if (!auth) console.log('Usuario no autenticado');
      })
    );
  }

  logout(): Promise<void> {
    return this.afAuth.signOut()
      .then(() => {
        console.log('Sesión cerrada exitosamente');
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
        throw error;
      });
  }

  getCurrentUser(): Promise<any> {
    return this.afAuth.currentUser;
  }

  // Método para verificar el estado de autenticación
  getAuthState(): Observable<any> {
    return this.afAuth.authState.pipe(
      tap(user => {
        if (user) {
          console.log('Usuario autenticado:', user);
        } else {
          console.log('Usuario no autenticado');
        }
      })
    );
  }

  // Agrega el método getUserEmail para obtener el correo del usuario autenticado
  async getUserEmail(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.email : null; // Devuelve el correo o null si no hay usuario
  }

  async getUserData() {
    return this.afAuth.currentUser;
  }

  async getUserId(): Promise<string> {
    const user = await this.afAuth.currentUser;
    return user?.uid || '';
  }
}
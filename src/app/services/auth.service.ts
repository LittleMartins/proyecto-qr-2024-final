import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private loadingController: LoadingController
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

  async logout(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.afAuth.signOut();
      await loading.dismiss();
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await loading.dismiss();
    }
  }

  getCurrentUser(): Promise<any> {
    return this.afAuth.currentUser;
  }

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

  async getUserEmail(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.email : null;
  }

  async getUserData() {
    const user = await this.afAuth.currentUser;
    const userDoc = await this.firestore.collection('users').doc(user?.uid).get().toPromise();
    return {
      email: user?.email,
      uid: user?.uid,
      displayName: user?.displayName,
      ...(userDoc?.data() || {})
    };
  }

  async getUserId(): Promise<string> {
    const user = await this.afAuth.currentUser;
    return user?.uid || '';
  }

  async recoverPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      console.log('Correo de recuperación enviado');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw error;
    }
  }

  getAlumnos() {
    return this.firestore
      .collection('users', ref => ref.where('rol', '==', 'alumno'))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const uid = a.payload.doc.id;
          return { uid, ...data };
        }))
      );
  }

  async updateCalificaciones(alumnoUid: string, calificaciones: any) {
    const timestamp = new Date();
    const docRef = await this.firestore.collection('calificaciones').add({
      alumnoUid,
      ...calificaciones,
      fechaRegistro: timestamp,
      docenteUid: (await this.afAuth.currentUser)?.uid,
      estado: 'activo'
    });
    
    // También actualizamos el documento del alumno con su última calificación
    await this.firestore.collection('users').doc(alumnoUid).update({
      calificaciones: {
        ...calificaciones,
        ultimaActualizacion: timestamp
      }
    });

    return docRef;
  }

  getCalificacionesAlumno(alumnoUid: string) {
    return this.firestore.collection('calificaciones', ref => 
      ref.where('alumnoUid', '==', alumnoUid)
         .where('estado', '==', 'activo')
         .orderBy('fechaRegistro', 'desc')
    ).valueChanges();
  }

  getAlumnosEspecificos(uids: string[]) {
    return this.firestore.collection('users', ref => 
      ref.where('uid', 'in', uids)
    ).valueChanges();
  }

  async getCalificacionesPorAsignatura(alumnoId: string, asignatura: string) {
    try {
      const docRef = this.firestore.doc(`calificaciones/${alumnoId}_${asignatura}`);
      const docSnap = await docRef.get().toPromise();
      return docSnap?.exists ? docSnap.data() : null;
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      return null;
    }
  }
}
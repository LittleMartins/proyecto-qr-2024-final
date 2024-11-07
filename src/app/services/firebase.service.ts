import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserData } from '../interfaces/user-data.interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {}

  async loginUser(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('uid', result.user.uid);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async logoutUser() {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('uid');
      return true;
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser() {
    return this.afAuth.currentUser;
  }

  getUserData(uid: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(uid)
      .get()
      .pipe(map(doc => doc));
  }

  async updateUserProfile(uid: string, userData: Partial<UserData>): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).set(userData, { merge: true });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  async uploadProfileImage(uid: string, imageDataUrl: string): Promise<string> {
    try {
      const path = `users/${uid}/profile-image`;
      const ref = this.storage.ref(path);
      await ref.putString(imageDataUrl, 'data_url');
      return await ref.getDownloadURL().toPromise();
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }
}
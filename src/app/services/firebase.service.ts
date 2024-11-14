import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserData } from '../interfaces/user-data.interface';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { first } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

interface Curso {
  id?: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  profesor: string;
  horario: string;
  sala: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Calificacion {
  id?: string;
  alumnoId: string;
  asignaturaId: string;
  asignaturaNombre: string;
  parcial1: number;
  parcial2: number;
  parcial3: number;
  examen: number;
  promedio: number;
  fechaRegistro: Date;
}

interface Asignatura {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  profesor: string;
  horario: string;
  sala: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Mensaje {
  id?: string;
  asunto: string;
  contenido: string;
  destinatarioId: string;
  destinatarioNombre: string;
  remitenteId: string;
  remitenteNombre: string;
  fecha: Date;
  leido: boolean;
}

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

  getUserData(uid: string) {
    return this.firestore.collection('users').doc(uid).get();
  }

  async updateUserProfile(uid: string, userData: Partial<UserData>): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).set(userData, { merge: true });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  async uploadProfileImage(uid: string, base64Image: string): Promise<string> {
    const storageRef = this.storage.ref(`profileImages/${uid}`);
    const uploadTask = await storageRef.putString(base64Image, 'data_url');
    return await uploadTask.ref.getDownloadURL();
  }

  // Métodos para cursos
  async inicializarCursos() {
    try {
      const cursosRef = this.firestore.collection('cursos');
      const snapshot = await cursosRef.get().toPromise();

      if (snapshot && (await snapshot).empty) {
        const cursosPredeterminados: Curso[] = [
          {
            nombre: 'Programación Web',
            codigo: 'PGY4121',
            descripcion: 'Desarrollo de aplicaciones web con tecnologías modernas',
            profesor: 'Juan Pérez',
            horario: 'Lunes y Miércoles 08:30 - 10:00',
            sala: 'Lab 301',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nombre: 'Arquitectura de Software',
            codigo: 'ASY4131',
            descripcion: 'Fundamentos de arquitectura y diseño de software',
            profesor: 'María González',
            horario: 'Martes y Jueves 10:15 - 11:45',
            sala: 'Sala 401',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nombre: 'Base de Datos',
            codigo: 'BDD4122',
            descripcion: 'Diseño y administración de bases de datos',
            profesor: 'Carlos Rodríguez',
            horario: 'Miércoles y Viernes 14:30 - 16:00',
            sala: 'Lab 302',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nombre: 'Aplicaciones Móviles',
            codigo: 'APM4133',
            descripcion: 'Desarrollo de aplicaciones móviles multiplataforma',
            profesor: 'Ana Silva',
            horario: 'Lunes y Jueves 16:15 - 17:45',
            sala: 'Lab 303',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const curso of cursosPredeterminados) {
          await cursosRef.add(curso);
        }
        console.log('Cursos predeterminados creados exitosamente');
      }
    } catch (error) {
      console.error('Error al inicializar cursos:', error);
      throw error;
    }
  }

  getCursos(): Observable<Curso[]> {
    return this.firestore
      .collection<Curso>('cursos', ref => ref.where('activo', '==', true))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = Object.assign({}, a.payload.doc.data());
          const id = a.payload.doc.id;
          return Object.assign(data, { id });
        }))
      );
  }

  getCurso(id: string): Observable<Curso | undefined> {
    return this.firestore
      .collection('cursos')
      .doc<Curso>(id)
      .valueChanges()
      .pipe(
        map(curso => curso ? { ...curso, id } : undefined)
      );
  }

  async actualizarCurso(id: string, curso: Partial<Curso>): Promise<void> {
    try {
      const cursoRef = this.firestore.collection('cursos').doc(id);
      await cursoRef.update({
        ...curso,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      throw error;
    }
  }

  async desactivarCurso(id: string): Promise<void> {
    try {
      await this.firestore.collection('cursos').doc(id).update({
        activo: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error al desactivar curso:', error);
      throw error;
    }
  }

  // Método para asignar curso a un alumno
  async asignarCursoAlumno(cursoId: string, alumnoId: string): Promise<void> {
    try {
      const inscripcionRef = this.firestore.collection('inscripciones').doc(`${cursoId}_${alumnoId}`);
      await inscripcionRef.set({
        cursoId,
        alumnoId,
        fechaInscripcion: new Date(),
        activo: true
      });
    } catch (error) {
      console.error('Error al asignar curso:', error);
      throw error;
    }
  }

  // Obtener cursos de un alumno
  getCursosAlumno(alumnoId: string): Observable<any[]> {
    return this.firestore
      .collection('inscripciones', ref => ref
        .where('alumnoId', '==', alumnoId)
        .where('activo', '==', true))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...(data as object), id };
        }))
      );
  }

  async guardarCalificacion(calificacion: Calificacion) {
    try {
      const calificacionId = `${calificacion.alumnoId}_${calificacion.asignaturaId}`;
      const asignaturas = await this.getAsignaturas();
      const asignatura = asignaturas.find(a => a.id === calificacion.asignaturaId);
      
      await this.firestore
        .collection('calificaciones')
        .doc(calificacionId)
        .set({
          ...calificacion,
          asignaturaNombre: asignatura?.nombre || '',
          updatedAt: new Date(),
          createdAt: new Date()
        }, { merge: true });
    } catch (error) {
      console.error('Error al guardar calificación:', error);
      throw error;
    }
  }

  async getCalificacionesAlumno(alumnoId: string): Promise<Calificacion[]> {
    try {
      const snapshot = await this.firestore
        .collection<Calificacion>('calificaciones')
        .ref
        .where('alumnoId', '==', alumnoId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Calificacion));
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      return [];
    }
  }

  async actualizarCalificacion(id: string, calificacion: Calificacion) {
    try {
      await this.firestore
        .collection('calificaciones')
        .doc(id)
        .update({
          ...calificacion,
          updatedAt: new Date()
        });
    } catch (error) {
      console.error('Error al actualizar calificación:', error);
      throw error;
    }
  }

  async getCalificacionesPorAsignatura(asignaturaId: string): Promise<Calificacion[]> {
    try {
      const snapshot = await this.firestore
        .collection<Calificacion>('calificaciones')
        .ref.where('asignaturaId', '==', asignaturaId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Calificacion));
    } catch (error) {
      console.error('Error al obtener calificaciones por asignatura:', error);
      return [];
    }
  }

  async getAsignaturas(): Promise<Asignatura[]> {
    try {
      const snapshot = await this.firestore
        .collection<Asignatura>('asignaturas')
        .ref
        .where('activo', '==', true)
        .get();
      
      const asignaturas = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Asignatura));

      console.log('Asignaturas recuperadas:', asignaturas);
      return asignaturas;
      
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      throw error;
    }
  }

  async crearAsignaturasIniciales() {
    const asignaturas: Asignatura[] = [
      {
        id: 'APM001',
        nombre: 'Aplicaciones Móviles',
        codigo: 'APM001',
        descripcion: 'Desarrollo de aplicaciones móviles',
        profesor: 'Por asignar',
        horario: 'Por definir',
        sala: 'Por asignar',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ARQ001',
        nombre: 'Arquitectura',
        codigo: 'ARQ001',
        descripcion: 'Fundamentos de arquitectura',
        profesor: 'Por asignar',
        horario: 'Por definir',
        sala: 'Por asignar',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CAL001',
        nombre: 'Calidad Software',
        codigo: 'CAL001',
        descripcion: 'Calidad y testing de software',
        profesor: 'Por asignar',
        horario: 'Por definir',
        sala: 'Por asignar',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'EST001',
        nombre: 'Estadística Descriptiva',
        codigo: 'EST001',
        descripcion: 'Estadística descriptiva y análisis de datos',
        profesor: 'Por asignar',
        horario: 'Por definir',
        sala: 'Por asignar',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      for (const asignatura of asignaturas) {
        await this.firestore.collection('asignaturas').doc(asignatura.id).set(asignatura);
      }
      console.log('Asignaturas creadas exitosamente');
    } catch (error) {
      console.error('Error al crear asignaturas:', error);
      throw error;
    }
  }

  async getUsuariosPorAsignatura(asignaturaId: string): Promise<any[]> {
    try {
      // Obtener todos los usuarios con rol 'alumno'
      const snapshot = await this.firestore
        .collection('users')
        .ref.where('rol', '==', 'alumno')
        .get();

      const usuarios = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as Record<string, any>)
      }));

      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async asignarAsignaturaAUsuario(userId: string, asignaturaId: string) {
    try {
      const userRef = this.firestore.collection('users').doc(userId);
      const userDoc = await userRef.get().toPromise();
      
      if (userDoc?.exists) {
        const userData = userDoc.data() as any;
        const asignaturas = userData.asignaturas || [];
        
        if (!asignaturas.includes(asignaturaId)) {
          await userRef.update({
            asignaturas: [...asignaturas, asignaturaId]
          });
        }
      }
    } catch (error) {
      console.error('Error al asignar asignatura:', error);
      throw error;
    }
  }

  // Método para crear usuarios de prueba si es necesario
  async crearUsuariosPrueba() {
    const usuarios = [
      {
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        rol: 'alumno',
        asignaturas: ['APM001', 'ARQ001'],
        foto: 'assets/avatar-default.png'
      },
      {
        nombre: 'María González',
        email: 'maria@test.com',
        rol: 'alumno',
        asignaturas: ['CAL001', 'EST001'],
        foto: 'assets/avatar-default.png'
      },
      // Agrega más usuarios si lo necesitas
    ];

    for (const usuario of usuarios) {
      try {
        await this.firestore.collection('users').add(usuario);
      } catch (error) {
        console.error('Error al crear usuario:', error);
      }
    }
  }

  // Métodos nuevos para la gestión de mensajes

  // Obtener todos los usuarios (para seleccionar destinatario)
  getUsuarios(rol?: string): Observable<any[]> {
    let query = this.firestore.collection('users');
    
    if (rol) {
      query = this.firestore.collection('users', ref => 
        ref.where('rol', '==', rol)
      );
    }

    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Enviar un nuevo mensaje
  async enviarMensaje(mensaje: Mensaje): Promise<void> {
    try {
      await this.firestore.collection('mensajes').add({
        ...mensaje,
        fecha: new Date(),
        leido: false
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  // Obtener mensajes recibidos por un usuario
  getMensajesRecibidos(userId: string): Observable<Mensaje[]> {
    return this.firestore
      .collection<Mensaje>('mensajes', ref => 
        ref.where('destinatarioId', '==', userId)
        .orderBy('fecha', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Mensaje;
          const id = a.payload.doc.id;
          return { ...data, id };
        }))
      );
  }

  // Obtener mensajes enviados por un usuario
  getMensajesEnviados(userId: string): Observable<Mensaje[]> {
    return this.firestore
      .collection<Mensaje>('mensajes', ref => 
        ref.where('remitenteId', '==', userId)
        .orderBy('fecha', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Mensaje;
          const id = a.payload.doc.id;
          return { ...data, id };
        }))
      );
  }

  // Marcar mensaje como leído
  async marcarComoLeido(mensajeId: string): Promise<void> {
    try {
      await this.firestore
        .collection('mensajes')
        .doc(mensajeId)
        .update({ leido: true });
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      throw error;
    }
  }

  // Eliminar mensaje
  async eliminarMensaje(mensajeId: string): Promise<void> {
    try {
      await this.firestore
        .collection('mensajes')
        .doc(mensajeId)
        .delete();
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      throw error;
    }
  }

  // Obtener cantidad de mensajes no leídos
  getMensajesNoLeidos(userId: string): Observable<number> {
    return this.firestore
      .collection<Mensaje>('mensajes', ref => 
        ref.where('destinatarioId', '==', userId)
        .where('leido', '==', false)
      )
      .valueChanges()
      .pipe(
        map(mensajes => mensajes.length)
      );
  }
}
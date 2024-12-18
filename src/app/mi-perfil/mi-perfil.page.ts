import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { ToastController } from '@ionic/angular';
import { UserData } from '../interfaces/user-data.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
})
export class MiPerfilPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  userData: any = {};
  profileImage: string | ArrayBuffer = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  isLoading = false;
  errorMessage = '';
  profileForm: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private auth: Auth,
    private angularFirestore: Firestore
  ) {
    this.profileForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      const user = await this.firebaseService.getCurrentUser();
      if (user) {
        this.firebaseService.getUserData(user.uid).subscribe({
          next: (doc: any) => {
            if (doc.exists) {
              this.userData = doc.data();
              this.profileImage = this.userData.profileImage || 'https://ionicframework.com/docs/img/demos/avatar.svg';
              
              this.profileForm.patchValue({
                nombre: this.userData.nombre || '',
                apellido: this.userData.apellido || '',
                email: this.userData.email || '',
                phone: this.userData.phone || ''
              });

              console.log('Datos cargados:', this.profileForm.value);
            }
          },
          error: (error) => {
            console.error('Error al cargar datos:', error);
            this.presentToast('Error al cargar los datos del perfil');
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.compressImage(reader.result as string, 0.7, (compressedImage) => {
            this.profileImage = compressedImage;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  compressImage(base64: string, quality: number, callback: (compressed: string) => void) {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      callback(compressedBase64);
    };
  }
  
  async onSubmit() {
    if (!this.profileForm.valid) {
      this.presentToast('Por favor completa todos los campos requeridos');
      return;
    }
  
    this.isLoading = true;
    const user = await this.firebaseService.getCurrentUser();
    
    if (user) {
      try {
        const updateData: Partial<UserData> = {
          name: this.userData.name,
          email: this.userData.email,
          phone: this.userData.phone,
          updatedAt: new Date()
        };
  
        if (this.profileImage !== this.userData.profileImage) {
          // Subir la imagen a Firebase Storage
          const imageUrl = await this.firebaseService.uploadProfileImage(
            user.uid,
            this.profileImage as string
          );
          updateData.profileImage = imageUrl; // Guardar solo la URL en Firestore
        }
  
        await this.firebaseService.updateUserProfile(user.uid, updateData);
        
        this.presentToast('Perfil actualizado exitosamente');
      } catch (error: any) {
        this.errorMessage = error.message;
        this.presentToast('Error al actualizar el perfil');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async guardarCambios() {
    try {
      const usuario = this.auth.currentUser;
      if (!usuario) {
        throw new Error('No hay usuario autenticado');
      }

      const perfilRef = doc(this.angularFirestore, 'users', usuario.uid);
      await setDoc(perfilRef, {
        nombre: this.profileForm.get('nombre')?.value || '',
        apellido: this.profileForm.get('apellido')?.value || '',
        email: usuario.email,
        phone: this.profileForm.get('phone')?.value || '',
        profileImage: this.profileImage,
        fechaActualizacion: new Date(),
        uid: usuario.uid
      });

      await this.presentToast('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al guardar:', error);
      await this.presentToast('Error al actualizar el perfil: ' + error.message);
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
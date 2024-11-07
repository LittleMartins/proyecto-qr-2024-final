import { TestBed } from '@angular/core/testing';
import { FirebaseService } from './firebase.service'; // Cambia el nombre aquí

describe('FirebaseService', () => { // Cambia el nombre aquí
  let service: FirebaseService; // Cambia el tipo aquí

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseService); // Cambia el nombre aquí
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
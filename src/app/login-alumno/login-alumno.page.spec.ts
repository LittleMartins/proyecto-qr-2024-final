import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginAlumnoPage } from './login-alumno.page';

describe('LoginAlumnoPage', () => {
  let component: LoginAlumnoPage;
  let fixture: ComponentFixture<LoginAlumnoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAlumnoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

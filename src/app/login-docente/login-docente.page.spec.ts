import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginDocentePage } from './login-docente.page';

describe('LoginDocentePage', () => {
  let component: LoginDocentePage;
  let fixture: ComponentFixture<LoginDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

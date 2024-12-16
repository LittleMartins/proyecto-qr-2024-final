import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrosHomePage } from './registros-home.page';

describe('RegistrosHomePage', () => {
  let component: RegistrosHomePage;
  let fixture: ComponentFixture<RegistrosHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrosHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

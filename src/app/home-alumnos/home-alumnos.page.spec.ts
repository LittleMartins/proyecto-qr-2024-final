import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeAlumnosPage } from './home-alumnos.page';

describe('HomeAlumnosPage', () => {
  let component: HomeAlumnosPage;
  let fixture: ComponentFixture<HomeAlumnosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAlumnosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

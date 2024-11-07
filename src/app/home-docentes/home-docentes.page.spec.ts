import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeDocentesPage } from './home-docentes.page';

describe('HomeDocentesPage', () => {
  let component: HomeDocentesPage;
  let fixture: ComponentFixture<HomeDocentesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDocentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

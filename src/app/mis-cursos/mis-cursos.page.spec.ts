import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisCursosPage } from './mis-cursos.page';

describe('MisCursosPage', () => {
  let component: MisCursosPage;
  let fixture: ComponentFixture<MisCursosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisCursosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

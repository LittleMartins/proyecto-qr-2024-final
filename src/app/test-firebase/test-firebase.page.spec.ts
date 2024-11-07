import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestFirebasePage } from './test-firebase.page';

describe('TestFirebasePage', () => {
  let component: TestFirebasePage;
  let fixture: ComponentFixture<TestFirebasePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFirebasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

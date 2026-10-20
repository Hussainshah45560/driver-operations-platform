import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOffboardingComponent } from './new-offboarding.component';

describe('NewOffboardingComponent', () => {
  let component: NewOffboardingComponent;
  let fixture: ComponentFixture<NewOffboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOffboardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOffboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewInductionComponent } from './new-induction.component';

describe('NewInductionComponent', () => {
  let component: NewInductionComponent;
  let fixture: ComponentFixture<NewInductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewInductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewInductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

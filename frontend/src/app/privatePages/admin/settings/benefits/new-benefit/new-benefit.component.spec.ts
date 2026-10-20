import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBenefitComponent } from './new-benefit.component';

describe('NewBenefitComponent', () => {
  let component: NewBenefitComponent;
  let fixture: ComponentFixture<NewBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBenefitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWarningReasonComponent } from './new-warning-reason.component';

describe('NewWarningReasonComponent', () => {
  let component: NewWarningReasonComponent;
  let fixture: ComponentFixture<NewWarningReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewWarningReasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewWarningReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

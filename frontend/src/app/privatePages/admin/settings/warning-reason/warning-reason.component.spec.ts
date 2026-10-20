import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningReasonComponent } from './warning-reason.component';

describe('WarningReasonComponent', () => {
  let component: WarningReasonComponent;
  let fixture: ComponentFixture<WarningReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningReasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

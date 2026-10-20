import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearanceTypeComponent } from './clearance-type.component';

describe('ClearanceTypeComponent', () => {
  let component: ClearanceTypeComponent;
  let fixture: ComponentFixture<ClearanceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearanceTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearanceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

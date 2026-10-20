import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleInspectionComponent } from './vehicle-inspection.component';

describe('VehicleInspectionComponent', () => {
  let component: VehicleInspectionComponent;
  let fixture: ComponentFixture<VehicleInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

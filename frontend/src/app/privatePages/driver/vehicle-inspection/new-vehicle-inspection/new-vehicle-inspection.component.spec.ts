import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVehicleInspectionComponent } from './new-vehicle-inspection.component';

describe('NewVehicleInspectionComponent', () => {
  let component: NewVehicleInspectionComponent;
  let fixture: ComponentFixture<NewVehicleInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewVehicleInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVehicleInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

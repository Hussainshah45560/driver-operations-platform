import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTestingComponent } from './vehicle-testing.component';

describe('VehicleTestingComponent', () => {
  let component: VehicleTestingComponent;
  let fixture: ComponentFixture<VehicleTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleTestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

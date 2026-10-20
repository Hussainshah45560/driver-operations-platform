import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverTestingComponent } from './driver-testing.component';

describe('DriverTestingComponent', () => {
  let component: DriverTestingComponent;
  let fixture: ComponentFixture<DriverTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverTestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

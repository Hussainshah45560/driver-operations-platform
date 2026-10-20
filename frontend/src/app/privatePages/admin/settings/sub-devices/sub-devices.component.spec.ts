import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDevicesComponent } from './sub-devices.component';

describe('SubDevicesComponent', () => {
  let component: SubDevicesComponent;
  let fixture: ComponentFixture<SubDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDevicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

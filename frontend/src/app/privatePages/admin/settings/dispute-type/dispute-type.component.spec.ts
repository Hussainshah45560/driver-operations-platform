import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisputeTypeComponent } from './dispute-type.component';

describe('DisputeTypeComponent', () => {
  let component: DisputeTypeComponent;
  let fixture: ComponentFixture<DisputeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisputeTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisputeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

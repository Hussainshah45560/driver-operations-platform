import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewClearanceTypeComponent } from './new-clearance-type.component';

describe('NewClearanceTypeComponent', () => {
  let component: NewClearanceTypeComponent;
  let fixture: ComponentFixture<NewClearanceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewClearanceTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewClearanceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

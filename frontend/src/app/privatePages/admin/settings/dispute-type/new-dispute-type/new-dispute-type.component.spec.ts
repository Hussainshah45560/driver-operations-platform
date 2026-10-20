import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDisputeTypeComponent } from './new-dispute-type.component';

describe('NewDisputeTypeComponent', () => {
  let component: NewDisputeTypeComponent;
  let fixture: ComponentFixture<NewDisputeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDisputeTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDisputeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

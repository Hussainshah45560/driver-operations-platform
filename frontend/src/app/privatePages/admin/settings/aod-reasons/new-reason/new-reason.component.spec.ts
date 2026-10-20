import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReasonComponent } from './new-reason.component';

describe('NewReasonComponent', () => {
  let component: NewReasonComponent;
  let fixture: ComponentFixture<NewReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReasonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

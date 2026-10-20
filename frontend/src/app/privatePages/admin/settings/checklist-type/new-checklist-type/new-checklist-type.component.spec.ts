import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChecklistTypeComponent } from './new-checklist-type.component';

describe('NewChecklistTypeComponent', () => {
  let component: NewChecklistTypeComponent;
  let fixture: ComponentFixture<NewChecklistTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChecklistTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChecklistTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

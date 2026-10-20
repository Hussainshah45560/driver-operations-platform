import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChecklistComponent } from './new-checklist.component';

describe('NewChecklistComponent', () => {
  let component: NewChecklistComponent;
  let fixture: ComponentFixture<NewChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChecklistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewIncidentComponent } from './new-incident.component';

describe('NewIncidentComponent', () => {
  let component: NewIncidentComponent;
  let fixture: ComponentFixture<NewIncidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewIncidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewIncidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

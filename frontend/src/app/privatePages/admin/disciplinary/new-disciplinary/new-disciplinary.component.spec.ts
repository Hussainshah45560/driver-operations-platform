import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDisciplinaryComponent } from './new-disciplinary.component';

describe('NewDisciplinaryComponent', () => {
  let component: NewDisciplinaryComponent;
  let fixture: ComponentFixture<NewDisciplinaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDisciplinaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDisciplinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

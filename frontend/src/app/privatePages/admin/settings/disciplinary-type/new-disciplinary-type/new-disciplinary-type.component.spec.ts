import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDisciplinaryTypeComponent } from './new-disciplinary-type.component';

describe('NewDisciplinaryTypeComponent', () => {
  let component: NewDisciplinaryTypeComponent;
  let fixture: ComponentFixture<NewDisciplinaryTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDisciplinaryTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDisciplinaryTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

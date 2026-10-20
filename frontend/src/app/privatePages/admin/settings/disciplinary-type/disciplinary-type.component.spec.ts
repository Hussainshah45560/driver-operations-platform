import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplinaryTypeComponent } from './disciplinary-type.component';

describe('DisciplinaryTypeComponent', () => {
  let component: DisciplinaryTypeComponent;
  let fixture: ComponentFixture<DisciplinaryTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplinaryTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplinaryTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

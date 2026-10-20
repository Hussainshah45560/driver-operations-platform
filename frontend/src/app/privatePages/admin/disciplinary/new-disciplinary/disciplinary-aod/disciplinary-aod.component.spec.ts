import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplinaryAodComponent } from './disciplinary-aod.component';

describe('DisciplinaryAodComponent', () => {
  let component: DisciplinaryAodComponent;
  let fixture: ComponentFixture<DisciplinaryAodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplinaryAodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplinaryAodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

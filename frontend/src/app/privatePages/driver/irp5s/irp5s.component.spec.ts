import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Irp5sComponent } from './irp5s.component';

describe('Irp5sComponent', () => {
  let component: Irp5sComponent;
  let fixture: ComponentFixture<Irp5sComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Irp5sComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Irp5sComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

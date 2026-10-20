import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqupimentsComponent } from './equpiments.component';

describe('EqupimentsComponent', () => {
  let component: EqupimentsComponent;
  let fixture: ComponentFixture<EqupimentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EqupimentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EqupimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

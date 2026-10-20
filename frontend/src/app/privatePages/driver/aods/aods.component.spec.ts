import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AodsComponent } from './aods.component';

describe('AodsComponent', () => {
  let component: AodsComponent;
  let fixture: ComponentFixture<AodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

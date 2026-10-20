import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAreaComponent } from './new-area.component';

describe('NewAreaComponent', () => {
  let component: NewAreaComponent;
  let fixture: ComponentFixture<NewAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

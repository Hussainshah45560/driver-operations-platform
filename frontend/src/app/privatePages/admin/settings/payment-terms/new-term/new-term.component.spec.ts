import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTermComponent } from './new-term.component';

describe('NewTermComponent', () => {
  let component: NewTermComponent;
  let fixture: ComponentFixture<NewTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTermComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

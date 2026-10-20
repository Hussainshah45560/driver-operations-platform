import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbAutoCompleteComponent } from './lb-auto-complete.component';

describe('LbAutoCompleteComponent', () => {
  let component: LbAutoCompleteComponent;
  let fixture: ComponentFixture<LbAutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LbAutoCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LbAutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

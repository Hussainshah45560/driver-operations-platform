import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AodReasonsComponent } from './aod-reasons.component';

describe('AodReasonsComponent', () => {
  let component: AodReasonsComponent;
  let fixture: ComponentFixture<AodReasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AodReasonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AodReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

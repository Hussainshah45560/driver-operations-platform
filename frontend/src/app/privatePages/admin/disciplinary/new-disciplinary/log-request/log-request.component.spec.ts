import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogRequestComponent } from './log-request.component';

describe('LogRequestComponent', () => {
  let component: LogRequestComponent;
  let fixture: ComponentFixture<LogRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

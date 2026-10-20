import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignNoticeComponent } from './sign-notice.component';

describe('SignNoticeComponent', () => {
  let component: SignNoticeComponent;
  let fixture: ComponentFixture<SignNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignNoticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

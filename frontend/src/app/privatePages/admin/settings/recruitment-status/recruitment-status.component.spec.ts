import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentStatusComponent } from './recruitment-status.component';

describe('RecruitmentStatusComponent', () => {
  let component: RecruitmentStatusComponent;
  let fixture: ComponentFixture<RecruitmentStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

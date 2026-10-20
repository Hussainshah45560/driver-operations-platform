import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRecruitmentComponent } from './new-recruitment.component';

describe('NewRecruitmentComponent', () => {
  let component: NewRecruitmentComponent;
  let fixture: ComponentFixture<NewRecruitmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRecruitmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRecruitmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

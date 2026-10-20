import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentTypesComponent } from './recruitment-types.component';

describe('RecruitmentTypesComponent', () => {
  let component: RecruitmentTypesComponent;
  let fixture: ComponentFixture<RecruitmentTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

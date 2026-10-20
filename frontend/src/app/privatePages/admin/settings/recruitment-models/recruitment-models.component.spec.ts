import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentModelsComponent } from './recruitment-models.component';

describe('RecruitmentModelsComponent', () => {
  let component: RecruitmentModelsComponent;
  let fixture: ComponentFixture<RecruitmentModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

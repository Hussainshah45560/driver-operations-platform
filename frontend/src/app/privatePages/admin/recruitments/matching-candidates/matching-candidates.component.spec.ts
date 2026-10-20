import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchingCandidatesComponent } from './matching-candidates.component';

describe('MatchingCandidatesComponent', () => {
  let component: MatchingCandidatesComponent;
  let fixture: ComponentFixture<MatchingCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingCandidatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchingCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationTypeComponent } from './relation-type.component';

describe('RelationTypeComponent', () => {
  let component: RelationTypeComponent;
  let fixture: ComponentFixture<RelationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

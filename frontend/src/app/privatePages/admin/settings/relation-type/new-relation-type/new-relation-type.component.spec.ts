import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRelationTypeComponent } from './new-relation-type.component';

describe('NewRelationTypeComponent', () => {
  let component: NewRelationTypeComponent;
  let fixture: ComponentFixture<NewRelationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRelationTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRelationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

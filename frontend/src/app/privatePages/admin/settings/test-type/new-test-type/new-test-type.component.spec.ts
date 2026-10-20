import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTestTypeComponent } from './new-test-type.component';

describe('NewTestTypeComponent', () => {
  let component: NewTestTypeComponent;
  let fixture: ComponentFixture<NewTestTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTestTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTestTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

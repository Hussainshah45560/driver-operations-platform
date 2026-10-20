import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAccountTypeComponent } from './new-account-type.component';

describe('NewAccountTypeComponent', () => {
  let component: NewAccountTypeComponent;
  let fixture: ComponentFixture<NewAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAccountTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

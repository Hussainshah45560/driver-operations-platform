import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNationalityComponent } from './new-nationality.component';

describe('NewNationalityComponent', () => {
  let component: NewNationalityComponent;
  let fixture: ComponentFixture<NewNationalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewNationalityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewNationalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLicenseCodeComponent } from './new-license-code.component';

describe('NewLicenseCodeComponent', () => {
  let component: NewLicenseCodeComponent;
  let fixture: ComponentFixture<NewLicenseCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewLicenseCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewLicenseCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

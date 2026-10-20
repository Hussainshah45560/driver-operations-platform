import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseCodesComponent } from './license-codes.component';

describe('LicenseCodesComponent', () => {
  let component: LicenseCodesComponent;
  let fixture: ComponentFixture<LicenseCodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseCodesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

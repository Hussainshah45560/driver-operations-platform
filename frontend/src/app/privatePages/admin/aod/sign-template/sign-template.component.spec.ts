import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignTemplateComponent } from './sign-template.component';

describe('SignTemplateComponent', () => {
  let component: SignTemplateComponent;
  let fixture: ComponentFixture<SignTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

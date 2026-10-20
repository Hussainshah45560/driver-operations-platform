import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AodTypesComponent } from './aod-types.component';

describe('AodTypesComponent', () => {
  let component: AodTypesComponent;
  let fixture: ComponentFixture<AodTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AodTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AodTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateContractComponent } from './generate-contract.component';

describe('GenerateContractComponent', () => {
  let component: GenerateContractComponent;
  let fixture: ComponentFixture<GenerateContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateContractComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

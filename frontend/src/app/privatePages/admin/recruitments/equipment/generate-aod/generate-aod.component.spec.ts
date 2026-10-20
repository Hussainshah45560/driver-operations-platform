import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAodComponent } from './generate-aod.component';

describe('GenerateAodComponent', () => {
  let component: GenerateAodComponent;
  let fixture: ComponentFixture<GenerateAodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateAodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateAodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AodComponent } from './aod.component';

describe('AodComponent', () => {
  let component: AodComponent;
  let fixture: ComponentFixture<AodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

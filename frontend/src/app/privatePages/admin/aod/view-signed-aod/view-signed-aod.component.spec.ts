import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSignedAodComponent } from './view-signed-aod.component';

describe('ViewSignedAodComponent', () => {
  let component: ViewSignedAodComponent;
  let fixture: ComponentFixture<ViewSignedAodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSignedAodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSignedAodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

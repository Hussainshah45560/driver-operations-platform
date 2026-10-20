import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegionComponent } from './new-region.component';

describe('NewRegionComponent', () => {
  let component: NewRegionComponent;
  let fixture: ComponentFixture<NewRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRegionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

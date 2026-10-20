import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAodComponent } from './new-aod.component';

describe('NewAodComponent', () => {
  let component: NewAodComponent;
  let fixture: ComponentFixture<NewAodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

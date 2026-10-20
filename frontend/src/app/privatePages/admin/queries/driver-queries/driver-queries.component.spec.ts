import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverQueriesComponent } from './driver-queries.component';

describe('DriverQueriesComponent', () => {
  let component: DriverQueriesComponent;
  let fixture: ComponentFixture<DriverQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverQueriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

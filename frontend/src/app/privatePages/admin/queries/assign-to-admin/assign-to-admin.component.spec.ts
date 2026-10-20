import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToAdminComponent } from './assign-to-admin.component';

describe('AssignToAdminComponent', () => {
  let component: AssignToAdminComponent;
  let fixture: ComponentFixture<AssignToAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignToAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignToAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTestComponent } from './book-test.component';

describe('BookTestComponent', () => {
  let component: BookTestComponent;
  let fixture: ComponentFixture<BookTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

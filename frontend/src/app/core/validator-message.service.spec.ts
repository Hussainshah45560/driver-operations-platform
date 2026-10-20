import { TestBed } from '@angular/core/testing';

import { ValidatorMessageService } from './validator-message.service';

describe('ValidatorMessageService', () => {
  let service: ValidatorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

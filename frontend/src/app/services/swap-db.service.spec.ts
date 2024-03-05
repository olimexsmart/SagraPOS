import { TestBed } from '@angular/core/testing';

import { SwapDBService } from './swap-db.service';

describe('SwapDBService', () => {
  let service: SwapDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

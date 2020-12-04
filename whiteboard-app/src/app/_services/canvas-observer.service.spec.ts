import { TestBed } from '@angular/core/testing';

import { CanvasObserverService } from './canvas-observer.service';

describe('CanvasObserverService', () => {
  let service: CanvasObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

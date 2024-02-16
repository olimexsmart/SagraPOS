import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPinComponent } from './dialog-pin.component';

describe('DialogPinComponent', () => {
  let component: DialogPinComponent;
  let fixture: ComponentFixture<DialogPinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogPinComponent]
    });
    fixture = TestBed.createComponent(DialogPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

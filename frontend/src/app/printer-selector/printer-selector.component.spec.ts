import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterSelectorComponent } from './printer-selector.component';

describe('PrinterSelectorComponent', () => {
  let component: PrinterSelectorComponent;
  let fixture: ComponentFixture<PrinterSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrinterSelectorComponent]
    });
    fixture = TestBed.createComponent(PrinterSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

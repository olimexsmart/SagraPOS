import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPrinterComponent } from './settings-printer.component';

describe('SettingsPrinterComponent', () => {
  let component: SettingsPrinterComponent;
  let fixture: ComponentFixture<SettingsPrinterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPrinterComponent]
    });
    fixture = TestBed.createComponent(SettingsPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPrintCategoriesComponent } from './settings-print-categories.component';

describe('SettingsPrintCategoriesComponent', () => {
  let component: SettingsPrintCategoriesComponent;
  let fixture: ComponentFixture<SettingsPrintCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPrintCategoriesComponent]
    });
    fixture = TestBed.createComponent(SettingsPrintCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

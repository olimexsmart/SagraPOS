import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCategoriesComponent } from './settings-categories.component';

describe('SettingsCategoriesComponent', () => {
  let component: SettingsCategoriesComponent;
  let fixture: ComponentFixture<SettingsCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsCategoriesComponent]
    });
    fixture = TestBed.createComponent(SettingsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

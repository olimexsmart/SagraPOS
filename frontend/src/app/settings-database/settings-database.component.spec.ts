import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDatabaseComponent } from './settings-database.component';

describe('SettingsDatabaseComponent', () => {
  let component: SettingsDatabaseComponent;
  let fixture: ComponentFixture<SettingsDatabaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsDatabaseComponent]
    });
    fixture = TestBed.createComponent(SettingsDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryModeComponent } from './inventory-mode.component';

describe('InventoryModeComponent', () => {
  let component: InventoryModeComponent;
  let fixture: ComponentFixture<InventoryModeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryModeComponent]
    });
    fixture = TestBed.createComponent(InventoryModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdateInventoryComponent } from './dialog-update-inventory.component';

describe('DialogUpdateInventoryComponent', () => {
  let component: DialogUpdateInventoryComponent;
  let fixture: ComponentFixture<DialogUpdateInventoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogUpdateInventoryComponent]
    });
    fixture = TestBed.createComponent(DialogUpdateInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

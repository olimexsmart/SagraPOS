import { ChangeDetectorRef, Component } from '@angular/core';
import { ConfirmDialogModel, DialogPinComponent } from '../dialog-pin/dialog-pin.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdateInventoryComponent, UpdateInventoryDialogModel } from '../dialog-update-inventory/dialog-update-inventory.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-inventory-mode',
  templateUrl: './inventory-mode.component.html',
  styleUrls: ['./inventory-mode.component.css']
})
export class InventoryModeComponent {
  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  modeActive: boolean = false
  pin: number = 0

  constructor(private dialog: MatDialog,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges(); // Is this variable necessary?
    this.mobileQuery.addListener(this.mobileQueryListener); // TODO fix this deprecation
  }

  public isActive(): boolean {
    return this.modeActive
  }

  public updateInventory(entryID: number): void {
    const dialogData = new UpdateInventoryDialogModel(this.pin, entryID);
    this.dialog.open(DialogUpdateInventoryComponent, {
      maxWidth: '350px',
      data: dialogData,
    });
  }

  toggleMode() {
    if (this.modeActive) {
      this.modeActive = false
    }
    else {
      const message = 'Modalità Inventario';
      const dialogData = new ConfirmDialogModel('Attivare?', message);
      const dialogRef = this.dialog.open(DialogPinComponent, {
        maxWidth: '350px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult.value === undefined) return
        this.pin = dialogResult.value
        this.modeActive = true
      });
    }
  }
}

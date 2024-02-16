import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogModel } from '../dialog-pin/dialog-pin.component';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-dialog-update-inventory',
  templateUrl: './dialog-update-inventory.component.html',
  styleUrls: ['./dialog-update-inventory.component.css']
})
export class DialogUpdateInventoryComponent {
  form: FormGroup = new FormGroup({
    newQuantity: new FormControl(),
  });

  constructor(public dialogRef: MatDialogRef<DialogUpdateInventoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateInventoryDialogModel,
    private inventoryService: InventoryService) {
  }

  onConfirm(): void {
    let newQuantity = this.form.controls["newQuantity"].value
    this.inventoryService.setQuantity(
      this.data.pin, 
      this.data.entryID, 
      newQuantity === "" ? null : newQuantity).subscribe(res => {
      // TODO errors
      // Close the dialog, return true
      this.dialogRef.close();
    })
  }

  onDismiss(): void {
    // Close the dialog, return undefined
    this.dialogRef.close()
  }
}

export class UpdateInventoryDialogModel {
  constructor(public pin: number, public entryID: number) {
    // TODO pre-filled title with EntryName+old value
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-dialog-pin',
  templateUrl: './dialog-pin.component.html',
  styleUrls: ['./dialog-pin.component.css']
})
export class DialogPinComponent {
  form: FormGroup = new FormGroup({
    PIN: new FormControl(),
  });
  title: string;
  message: string;
  constructor(public dialogRef: MatDialogRef<DialogPinComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel,
    private settingService: SettingsService) {
    this.title = data.title;
    this.message = data.message;
  }

  onConfirm(): void {
    this.settingService.checkPin(parseInt(this.form.controls['PIN'].value)).subscribe(valid => {
      if (valid) {
        // Close the dialog, return pin to be sed in other requests
        this.dialogRef.close(this.form.controls['PIN']);
      }
      else {
        this.form.controls['PIN'].setErrors({ 'incorrect': true });
      }
    })
  }

  onDismiss(): void {
    // Close the dialog, return undefined
    this.dialogRef.close()
  }
}

export class ConfirmDialogModel {
  constructor(public title: string, public message: string) {
  }
}


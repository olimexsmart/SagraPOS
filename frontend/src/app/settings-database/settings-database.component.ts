import { Component } from '@angular/core';
import { SwapDBService } from '../services/swap-db.service';

@Component({
  selector: 'app-settings-database',
  templateUrl: './settings-database.component.html',
  styleUrls: ['./settings-database.component.css']
})
export class SettingsDatabaseComponent {

  constructor(private swapDBService: SwapDBService) {  }

  downloadDB() {
    this.swapDBService.downloadFile()
  }

  triggerFilePicker(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.sqlite3';
    fileInput.onchange = this.uploadDB.bind(this);
    fileInput.click();
  }

  private uploadDB(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.swapDBService.uploadFile(file);
    }
  }
}

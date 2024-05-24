import { Component, OnInit } from '@angular/core';
import { SwapDBService } from '../services/swap-db.service';
import { SettingsService } from '../services/settings.service';
import { Setting } from '../interfaces/setting';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings-database',
  templateUrl: './settings-database.component.html',
  styleUrls: ['./settings-database.component.css']
})
export class SettingsDatabaseComponent implements OnInit {
  settings: Setting[] = []
  private pin: number

  constructor(
    private swapDBService: SwapDBService,
    private settingService: SettingsService,
    private router: Router
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];

    if (this.pin === undefined)
      this.router.navigate(['settings'])
  }

  ngOnInit(): void {
    this.settingService.getSettings().subscribe(data => {
      this.settings = data
    })
  }

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

  onFileSelected(event: Event, setting: Setting): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate the file type
      if (file.type !== 'image/png') {
        alert('Only PNG files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setting.value = (reader.result as string).split(',')[1]; // Extract base64 data
      };
      reader.readAsDataURL(file);
    }
  }

  saveSetting(setting: Setting): void {
    this.settingService.saveSetting(this.pin, setting).subscribe({
      next: response => {
        console.log('Setting saved successfully', response);
      },
      error: error => {
        console.error('Error saving setting', error);
      }
    });
  }
}

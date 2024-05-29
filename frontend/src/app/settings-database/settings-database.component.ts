import { Component, OnInit } from '@angular/core';
import { SwapDBService } from '../services/swap-db.service';
import { SettingsService } from '../services/settings.service';
import { Setting, SettingCategory } from '../interfaces/setting';
import { Router } from '@angular/router';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';


@Component({
  selector: 'app-settings-database',
  templateUrl: './settings-database.component.html',
  styleUrls: ['./settings-database.component.css']
})
export class SettingsDatabaseComponent implements OnInit {
  settingsByCat = new Map<number, Setting[]>()
  private pin: number
  loading: boolean = false

  constructor(
    private swapDBService: SwapDBService,
    private settingService: SettingsService,
    private router: Router,
    private snackBar: EmojiSnackBarService
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];

    if (this.pin === undefined)
      this.router.navigate(['settings'])
  }

  ngOnInit(): void {
    this.loading = true
    this.settingService.getSettings().subscribe({
      next: data => {
        let settings: Setting[] = data
        this.settingsByCat = settings.reduce((sByCat, s) => {
          if (sByCat.has(s.category.id))
            sByCat.get(s.category.id)?.push(s)
          else
            sByCat.set(s.category.id, [s])
          return sByCat
        }, new Map<number, Setting[]>())
        this.loading = false
      },
      error: () => {
        this.snackBar.showError()
        this.loading = false
      }
    }
    )
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
      // After this call whole app is reloaded
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
    this.loading = true
    this.settingService.saveSetting(this.pin, setting)
      .subscribe({
        complete: () => {
          this.snackBar.showSuccess()
          this.loading = false
        },
        error: () => {
          this.snackBar.showError()
          this.loading = false
        }
      });
  }
}

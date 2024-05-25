import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as QRCode from 'qrcode';
import { ServerSettings } from '../interfaces/server-settings';
import { SettingsService } from '../services/settings.service';


@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css'
})
export class QrCodeComponent implements OnInit {
  serverSettings: ServerSettings | undefined;
  wifiQRCode: any;
  urlQRCode: any;

  constructor(private sanitizer: DomSanitizer, private settingsService: SettingsService,
  ) { }

  ngOnInit() {
    this.settingsService.getServerSettings().subscribe(serverSettings => {
      this.serverSettings = serverSettings
      if (this.serverSettings.wifi) {
        this.generateQRCode(`WIFI:T:WPA;S:${this.serverSettings.wifi.ssid};P:${this.serverSettings.wifi.password};;`, 'wifi');
      }

      if (this.serverSettings.serverUrl) {
        this.generateQRCode(this.serverSettings.serverUrl, 'url');
      }
    }
    );
  }

  generateQRCode(data: string, type: 'wifi' | 'url') {
    QRCode.toDataURL(data, (err, url) => {
      if (type === 'wifi') {
        this.wifiQRCode = this.sanitizer.bypassSecurityTrustUrl(url);
      } else {
        this.urlQRCode = this.sanitizer.bypassSecurityTrustUrl(url);
      }
    });
  }

}

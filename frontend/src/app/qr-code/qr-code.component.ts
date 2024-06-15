import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as QRCode from 'qrcode';
import { SettingsService } from '../services/settings.service';
import { Subscription, forkJoin } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';
import { WebSocketMessage } from '../interfaces/web-socket-message';


@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css'
})
export class QrCodeComponent implements OnInit, OnDestroy {
  serverURL: string | undefined = undefined
  wifiSSID: string | undefined = undefined
  wifiPassword: string | undefined = undefined
  clientCounterSubscription: Subscription | undefined;
  clientConnectionCounter: number = 0;


  urlQRCode: any;
  wifiQRCode: any;

  constructor(private sanitizer: DomSanitizer,
    private settingsService: SettingsService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    forkJoin({
      serverURL: this.settingsService.getSettingByValue('ServerURL'),
      wifiSSID: this.settingsService.getSettingByValue('WiFiSSID'),
      wifiPassword: this.settingsService.getSettingByValue('WiFiPassword')
    }).subscribe({
      next: ({ serverURL, wifiSSID, wifiPassword }) => {
        if (wifiSSID && wifiPassword) {
          this.wifiSSID = wifiSSID.value
          this.wifiPassword = wifiPassword.value
          this.generateQRCode(`WIFI:T:WPA;S:${wifiSSID.value};P:${wifiPassword.value};;`, 'wifi');
        }
        if (serverURL) {
          this.serverURL = serverURL.value
          this.generateQRCode(serverURL.value, 'url');
        }
      },
      error: (err) => {
        console.error('Error loading data', err);
      }
    })
    this.clientCounterSubscription = this.webSocketService.onMessage().subscribe(res => {
      this.onWebSocketMessage(res);
    })
  }

  ngOnDestroy(): void {
    if(this.clientCounterSubscription){
      this.clientCounterSubscription.unsubscribe();
    }
  }

  generateQRCode(data: string, type: 'wifi' | 'url') { // Nicely done here 
    QRCode.toDataURL(data, (err, url) => {
      if (type === 'wifi') {
        this.wifiQRCode = this.sanitizer.bypassSecurityTrustUrl(url);
      } else {
        this.urlQRCode = this.sanitizer.bypassSecurityTrustUrl(url);
      }
    });
  }

  onWebSocketMessage(res: WebSocketMessage) {
    if (res) {
      switch (res.type) {
        case 'clientCount':
          this.clientConnectionCounter = res.data;
          break;
      }
    }
  }
}

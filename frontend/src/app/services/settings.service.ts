import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Printer } from '../interfaces/printer';
import { Observable } from 'rxjs';
import { BooleanResult } from '../interfaces/boolean-result';
import { ServerSettings } from '../interfaces/server-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  checkPin(pin: number): Observable<BooleanResult> {
    return this.http.get<BooleanResult>(this.baseUrl + `CheckPin?pin=${pin}`)
  }

  getServerSettings(): Observable<ServerSettings> {
    return this.http.get<ServerSettings>(this.baseUrl + 'GetServerSettings');
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Printer } from '../interfaces/printer';
import { Observable } from 'rxjs';
import { BooleanResult } from '../interfaces/boolean-result';
import { Setting } from '../interfaces/setting';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  checkPin(pin: number): Observable<BooleanResult> {
    return this.http.get<BooleanResult>(this.baseUrl + `CheckPin?pin=${pin}`)
  }

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.baseUrl + `GetAllSettings`)
  }

  saveSetting(pin: number, setting: Setting): Observable<void> {
    return this.http.put<void>(this.baseUrl + `ChangeSetting?pin=${pin}`, setting)
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
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

  getSettingByValue(key: string): Observable<Setting> {
    return this.http.get<Setting>(this.baseUrl + `GetSettingByKey?key=${key}`)
  }

  saveSetting(pin: number, setting: Setting): Observable<void> {
    return this.http.put<void>(this.baseUrl + `ChangeSetting?pin=${pin}`, setting)
  }

  getLocalIP(): Observable<string | null> {
    return this.http.get(this.baseUrl + 'GetLocalIP', { responseType: 'text' }).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null); // Return null if the response is a 404 error
        } else {
          throw error; // Re-throw other errors
        }
      })
    );
  }
}

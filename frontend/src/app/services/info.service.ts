import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InfoOrders } from '../interfaces/info-orders';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getInfoOrder(): Observable<InfoOrders> {
    return this.http.get<InfoOrders>(this.baseUrl + `GetInfoOrders`)
  }

  resetInfoOrder(pin: number): Observable<any> {
   return this.http.delete(this.baseUrl + `ResetInfoOrders?pin=${pin}`)
  }

  printInfo(printerID: number): Observable<any> {
    return this.http.get(this.baseUrl + `PrintInfo?printerID=${printerID}`)
  }
}

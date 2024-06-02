import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdersInfo } from '../interfaces/info-orders-dto';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getInfoOrder(): Observable<OrdersInfo> {
    return this.http.get<OrdersInfo>(this.baseUrl + `GetOrdersInfo`)
  }

  resetInfoOrder(pin: number): Observable<any> {
   return this.http.delete(this.baseUrl + `ResetOrdersInfo?pin=${pin}`)
  }

  printInfo(printerID: number): Observable<any> {
    return this.http.get(this.baseUrl + `PrintOrdersInfo?printerID=${printerID}`)
  }
}

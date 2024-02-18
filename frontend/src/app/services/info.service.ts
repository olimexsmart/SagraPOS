import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InfoOrdersDTO } from '../interfaces/info-orders-dto';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getInfoOrder(): Observable<InfoOrdersDTO> {
    return this.http.get<InfoOrdersDTO>(this.baseUrl + `GetInfoOrders`)
  }

  resetInfoOrder(pin: number): Observable<any> {
   return this.http.delete(this.baseUrl + `ResetInfoOrders?pin=${pin}`)
  }

  printInfo(printerID: number): Observable<any> {
    return this.http.get(this.baseUrl + `PrintInfo?printerID=${printerID}`)
  }
}

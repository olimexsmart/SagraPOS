import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuEntry } from '../interfaces/menu-entry-dto';
import { BooleanResult } from '../interfaces/boolean-result';
import { OrderEntryDTO } from '../interfaces/order-entry-dto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  postPrintOrder(printerID: number, order: Map<MenuEntry, number>): Observable<any> {
    let plainOrder: OrderEntryDTO[] = []
    for (const [key, value] of order) {
      plainOrder.push({
        menuEntryID: key.id,
        quantity: value
      })
    }
    // Sending also time because server is assumed to not have accurate time info
    return this.http.post<any>(this.baseUrl + `ConfirmOrder?printerID=${printerID}&now=${new Date().toISOString()}`, plainOrder)
  }
}

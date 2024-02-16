import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventory } from '../interfaces/inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  // TODO https://angular.io/guide/http-handle-request-errors

  getQuantities(): Observable<Inventory> {
    return this.http.get<Inventory>(this.baseUrl + `GetQuantities`)
  }

  setQuantity(pin: number, entryID: number, quantity?: number): Observable<any> {
    let quantQuery = ''
    if (quantity !== null)
      quantQuery = `&quantity=${quantity}`
    return this.http.put(this.baseUrl + `SetQuantity?pin=${pin}&entryID=${entryID}${quantQuery}`, null)
  }
}


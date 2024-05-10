import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Printer } from '../interfaces/printer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getPrinters(): Observable<Printer[]> {
    return this.http.get<Printer[]>(this.baseUrl + `GetPrinters`)
  }

  
}

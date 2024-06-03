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

  insertPrinter(pin: number, p: Printer): Observable<void> {
    return this.http.post<void>(this.baseUrl + `InsertPrinter?pin=${pin}`, p)
  }

  updatePrinter(pin: number, p: Printer): Observable<void> {
    return this.http.put<void>(this.baseUrl + `UpdatePrinter?pin=${pin}`, p)
  }

  deletePrinter(pin: number, id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `DeletePrinter?id=${id}&pin=${pin}`)
  }

  scanPrinters(port: number ): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + `ScanPrinters?port=${port}`)
  }

  pokePrinter(p: Printer): Observable<void> {
    return this.http.post<void>(this.baseUrl + `PokePrinter`, p)
  }

  printFakeOrder(printerID: number): Observable<void> {
    return this.http.get<void>(this.baseUrl + `PrintFakeOrder?printerID=${printerID}`)
  }
}

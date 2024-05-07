import { Inject, Injectable } from '@angular/core';
import { MenuCategory } from '../interfaces/menu-categories';
import { MenuEntry } from '../interfaces/menu-entry-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService { // TODO consider splitting this service up

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  /*
   * MENU CATEGORIES
   */
  getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(this.baseUrl + `GetCategories`)
  }

  insertCategory(pin: number, mc: MenuCategory): Observable<void> {
    return this.http.post<void>(this.baseUrl + `InsertCategory?pin=${pin}`, mc)
  }

  updateCategory(pin: number, mc: MenuCategory): Observable<void> {
    return this.http.put<void>(this.baseUrl + `UpdateCategory?pin=${pin}`, mc)
  }

  deleteCategory(pin: number, id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `DeleteCategory?id=${id}&pin=${pin}`)
  }

  /*
   * PRINT CATEGORIES
   */
  getPrintCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(this.baseUrl + `GetPrintCategories`)
  }

  insertPrintCategory(pin: number, mc: MenuCategory): Observable<void> {
    return this.http.post<void>(this.baseUrl + `InsertPrintCategory?pin=${pin}`, mc)
  }

  updatePrintCategory(pin: number, mc: MenuCategory): Observable<void> {
    return this.http.put<void>(this.baseUrl + `UpdatePrintCategory?pin=${pin}`, mc)
  }

  deletePrintCategory(pin: number, id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `DeletePrintCategory?id=${id}&pin=${pin}`)
  }

  /*
   * MENU ENTRIES
   */
  getMenuEntries(): Observable<MenuEntry[]> {
    return this.http.get<MenuEntry[]>(this.baseUrl + `GetMenuEntries`)
  }

  insertMenuEntry(pin: number, me: MenuEntry): Observable<void> {
    return this.http.post<void>(this.baseUrl + `InsertMenuEntry?pin=${pin}`, me)
  }

  updateMenuEntry(pin: number, me: MenuEntry): Observable<void> {
    return this.http.put<void>(this.baseUrl + `UpdateMenuEntry?pin=${pin}`, me)
  }

  deleteMenuEntry(pin: number, id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `DeleteMenuEntry?id=${id}&pin=${pin}`)
  }

  uploadImage(pin: number, id: number, selectedFile: File): Observable<void> {
    const formData = new FormData();
    formData.append('image', selectedFile, selectedFile.name);
    return this.http.put<void>(this.baseUrl + `UpdateImage?id=${id}&pin=${pin}`, formData)
  }

}

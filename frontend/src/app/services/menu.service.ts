import { Inject, Injectable } from '@angular/core';
import { MenuCategory } from '../interfaces/menu-categories';
import { MenuEntryDTO } from '../interfaces/menu-entry-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

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

  getMenuEntries(): Observable<MenuEntryDTO[]> {
    return this.http.get<MenuEntryDTO[]>(this.baseUrl + `GetMenuEntryDTOs`)
  }
}

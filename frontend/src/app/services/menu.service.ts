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

  getMenuEntries(): Observable<MenuEntryDTO[]> {
    return this.http.get<MenuEntryDTO[]>(this.baseUrl + `GetEntries`)
  }
}

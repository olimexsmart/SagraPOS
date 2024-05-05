import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() {
    // Retrieve the theme preference from localStorage
    this.isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
  }

  isDarkTheme: boolean = false;

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    // Save the theme preference to localStorage
    localStorage.setItem('isDarkTheme', this.isDarkTheme.toString());
  }
}

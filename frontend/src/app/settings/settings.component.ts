import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

export interface SidenavRoute {
  // id?: string;
  isHeader: boolean;
  label: string;
  icon: string;
  route: string;
}


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;

  myWorkRoutes: SidenavRoute[] = [{
    isHeader: false, // TODO remove this functionality
    label: 'Printer',
    icon: 'print',
    route: 'printer'
  }, {
    isHeader: false,
    label: 'Categories',
    icon: 'category',
    route: 'categories'
  }, {
    isHeader: false,
    label: 'Menu',
    icon: 'menu_book',
    route: 'menu'
  }, {
    isHeader: false,
    label: 'Print Categories',
    icon: 'print',
    route: 'printCategories'
  }, {
    isHeader: false,
    label: 'Database',
    icon: 'storage',
    route: 'database'
  }]


  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges(); // Is this variable necessary?
    this.mobileQuery.addListener(this.mobileQueryListener); // TODO fix this deprecation
  }

  @ViewChild('sidenav') sidenav!: MatDrawer;

  ngAfterViewInit() {
    setTimeout(() => {
      this.sidenav.open()
    })
  }

  sidenavItemClick() {
    console.log('clikkk');
    
    if (this.mobileQuery.matches) {
      this.sidenav.close()
    }
  }

}

import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ConfirmDialogModel, DialogPinComponent } from '../dialog-pin/dialog-pin.component';
import { MatDialog } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';

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
export class SettingsComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private pin: number = 0
  private mobileQueryListener: () => void;

  myWorkRoutes: SidenavRoute[] = [{
    isHeader: false, // TODO remove this functionality
    label: 'Printer',
    icon: 'print',
    route: 'printer'
  }, {
    isHeader: false,
    label: 'Categories',
    icon: 'tabs',
    route: 'categories'
  }, {
    isHeader: false,
    label: 'Print Categories',
    icon: 'confirmation_number',
    route: 'printCategories'
  }, {
    isHeader: false,
    label: 'Menu',
    icon: 'restaurant_menu',
    route: 'menu'
  }, {
    isHeader: false,
    label: 'Sistema',
    icon: 'settings',
    route: 'database'
  }]


  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private dialog: MatDialog,
    private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges(); // Is this variable necessary?
    this.mobileQuery.addListener(this.mobileQueryListener); // TODO fix this deprecation
  }

  @ViewChild('sidenav') sidenav!: MatDrawer;

  ngOnInit(): void {
    const dialogData = new ConfirmDialogModel('PIN Amministrazione', '');
    const dialogRef = this.dialog.open(DialogPinComponent, {
      maxWidth: '350px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      // TODO understand if instead of .value can be specified a strong type
      if (dialogResult.value === undefined) return
      this.pin = dialogResult.value
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sidenav.open()
    })
  }

  sidenavItemClick(route: string) {
    if (this.mobileQuery.matches) {
      this.sidenav.close()
    }
    // Open detail settings passing administrator pin
    const navigationExtras: NavigationExtras = {
      state: {
        pin: this.pin
      }
    };
    this.router.navigate(['settings/' + route], navigationExtras);
  }
}

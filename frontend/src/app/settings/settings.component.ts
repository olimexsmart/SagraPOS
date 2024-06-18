import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ConfirmDialogModel, DialogPinComponent } from '../dialog-pin/dialog-pin.component';
import { MatDialog } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';

export interface SidenavRoute {
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
  selectedRoute: string | null = null; // Used to toggle CSS when list item is clicked

  myWorkRoutes: SidenavRoute[] = [{
    isHeader: false, // TODO remove this functionality
    label: 'Stampanti',
    icon: 'print',
    route: 'printer'
  }, {
    isHeader: false,
    label: 'Categorie',
    icon: 'tabs',
    route: 'categories'
  }, {
    isHeader: false,
    label: 'Categorie Stampa',
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
    this.mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.onScreenResize();
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  @ViewChild('sidenav') sidenav!: MatDrawer;

  ngOnInit(): void {
    const dialogData = new ConfirmDialogModel('PIN Amministrazione', 'Default: 1234'); // TODO uniformare questi messaggi
    const dialogRef = this.dialog.open(DialogPinComponent, {
      maxWidth: '350px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      // TODO understand if instead of .value can be specified a strong type
      if (dialogResult?.value === undefined)
        this.router.navigate(['main'])
      else {
        this.pin = dialogResult.value
        this.sidenavItemClick(this.myWorkRoutes[0].route) // To be sure the pin is passed to the child component
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sidenav.open()
    })
  }

  onScreenResize() {
    if (!this.mobileQuery.matches) {
      this.sidenav.open()
    }
  }

  sidenavItemClick(route: string) {
    if (this.mobileQuery.matches) {
      this.sidenav.close()
    }
    // Open detail settings passing administrator pin
    const navigationExtras: NavigationExtras = {
      state: {
        pin: this.pin,
        route: route
      }
    };
    this.router.navigate(['settings/' + route], navigationExtras);
    this.selectedRoute = route
  }

  ngOnDestroy() {
    // Clean up by removing the event listener when the component is destroyed
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }
}

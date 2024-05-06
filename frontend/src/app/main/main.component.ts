import { InventoryService } from '../services/inventory.service';
import { Inventory } from './../interfaces/inventory';
import { Component, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { MenuEntry } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { MatDrawer } from '@angular/material/sidenav';
import { MenuService } from '../services/menu.service';
import { SwapDBService } from '../services/swap-db.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  title = 'SagraPOS';
  categories: MenuCategory[] = []
  menuEntries: MenuEntry[] = []
  badgeCount: Inventory = {}

  constructor(
    @Inject('BASE_URL') public baseUrl: string,
    private menuService: MenuService,
    private inventoryService: InventoryService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
      this.mobileQuery = media.matchMedia('(max-width: 600px)');
      this.mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  @ViewChild('sidenav') sidenav!: MatDrawer;

  ngOnInit(): void {
    this.menuService.getCategories().subscribe(categories => this.categories = categories)
    this.menuService.getMenuEntries().subscribe(menuEntries => this.menuEntries = menuEntries)
    this.inventoryService.getQuantities().subscribe(badgeCount => this.badgeCount = badgeCount)
    setInterval(() => {
      this.inventoryService.getQuantities().subscribe(badgeCount => this.badgeCount = badgeCount)
    }, 1000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Avoid opening if on mobile
      if (!this.mobileQuery.matches)
        this.sidenav.open()
    })
  }

  shouldCloseOrderCheck() {
    if (this.mobileQuery.matches)
      this.sidenav.close()
  }



  ngOnDestroy() {
    // Clean up by removing the event listener when the component is destroyed
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }
}

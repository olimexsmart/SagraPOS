import { InventoryService } from '../services/inventory.service';
import { Inventory } from './../interfaces/inventory';
import { Component, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { MenuEntry } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { MatDrawer } from '@angular/material/sidenav';
import { MenuService } from '../services/menu.service';
import { ThemeService } from '../services/theme.service';
import { WebSocketService } from '../services/web-socket.service';
import { Subscription } from 'rxjs';
import { WebSocketMessage } from '../interfaces/web-socket-message';

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
  printCategories: MenuCategory[] = []
  menuEntries: MenuEntry[] = []
  badgeCount: Inventory = {}
  inventorySubscription: Subscription | undefined;

  constructor(
    @Inject('BASE_URL') public baseUrl: string,
    private menuService: MenuService,
    public themeService: ThemeService,
    private webSocketService: WebSocketService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
      this.mobileQuery = media.matchMedia('(max-width: 600px)');
      this.mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  @ViewChild('sidenav') sidenav!: MatDrawer;


  ngOnInit(): void {
    this.menuService.getCategories().subscribe(categories => this.categories = categories.sort((a, b) => a.ordering - b.ordering))
    this.menuService.getPrintCategories().subscribe(printCategories => this.printCategories = printCategories.sort((a, b) => a.ordering - b.ordering))
    this.menuService.getMenuEntries().subscribe(menuEntries => this.menuEntries = menuEntries.sort((a, b) => a.ordering - b.ordering))

    this.inventorySubscription = this.webSocketService.onMessage().subscribe(res => {
      this.onWebSocketMessage(res);
    })
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

  onWebSocketMessage(res: WebSocketMessage) {
    if (res) {
      switch (res.type) {
        case 'inventory':
          this.badgeCount = res.data;
          break;
      }
    }
  }

  ngOnDestroy() {
    // Clean up by removing the event listener when the component is destroyed
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
    if(this.inventorySubscription){
      this.inventorySubscription.unsubscribe();
    }
  }
}

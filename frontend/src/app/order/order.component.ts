import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuEntry } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { OrderService } from '../services/order.service';
import { Printer } from '../interfaces/printer';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {

  @Input() selectedPrinter: Printer = null!
  @Input() categories: MenuCategory[] = [];
  @Input() menu: MenuEntry[] = [];
  @Output() orderConfirmed = new EventEmitter<string>();

  order: Map<MenuEntry, number> = new Map()
  catPresent: Map<number, number> = new Map()
  total: number = 0
  printing: boolean = false

  constructor(
    private orderService: OrderService,
    private snackBar: EmojiSnackBarService,
  ) { }

  addEntry(entry: MenuEntry): void {
    this.order.set(entry, (this.order.get(entry) ?? 0) + 1)
    this.catPresent.set(entry.categoryID, (this.catPresent.get(entry.categoryID) ?? 0) + 1)
    this.total += entry.price
  }

  removeEntry(entry: MenuEntry): void {
    this.order.set(entry, (this.order.get(entry) ?? 0) - 1)
    if (this.order.get(entry) === 0) {
      this.order.delete(entry)
    }
    this.catPresent.set(entry.categoryID, (this.catPresent.get(entry.categoryID) ?? 0) - 1)
    this.total -= entry.price
  }

  getEntriesNumber(): number {
    let sum = 0;
    for (const value of this.order.values()) {
      sum += value;
    }
    return sum
  }

  printAndClear(): void {
    this.printing = true
    this.orderService.postPrintOrder(this.selectedPrinter.id, this.order).subscribe({
      complete: () => {
        this.order.clear()
        this.catPresent.clear()
        this.total = 0
        this.orderConfirmed.emit()
        this.printing = false
        this.snackBar.showSuccess('Ordine OK')
      },
      error: () => {
        this.snackBar.showError('Ordine in errore')
        this.printing = false
      }
    })
  }

  /*
   * // TODO add outbound event fired on printAndClear
   * is catched by main component 
   * and closes the sidebar when on mobile
   */
}

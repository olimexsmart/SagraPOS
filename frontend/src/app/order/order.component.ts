import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuEntryDTO } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { OrderService } from '../services/order.service';
import { Printer } from '../interfaces/printer';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {

  @Input() selectedPrinter: Printer = null!
  @Input() categories: MenuCategory[] = [];
  @Input() menu: MenuEntryDTO[] = [];
  @Output() orderConfirmed = new EventEmitter<string>();

  order: Map<MenuEntryDTO, number> = new Map()
  catPresent: Map<number, number> = new Map()
  total: number = 0

  constructor(private orderService: OrderService) { }

  addEntry(entry: MenuEntryDTO): void {
    this.order.set(entry, (this.order.get(entry) ?? 0) + 1)
    this.catPresent.set(entry.categoryID, (this.catPresent.get(entry.categoryID) ?? 0) + 1)
    this.total += entry.price
  }

  removeEntry(entry: MenuEntryDTO): void {
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
    this.orderService.postPrintOrder(this.selectedPrinter.id, this.order).subscribe(() => {
      this.order.clear()
      this.catPresent.clear()
      this.total = 0
      this.orderConfirmed.emit()
    })
  }

  /*
   * // TODO add outbound event fired on printAndClear
   * is catched by main component 
   * and closes the sidebar when on mobile
   */
}

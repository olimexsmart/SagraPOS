import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { ArePrintersEqual, InitEmptyPrinter, Printer } from '../interfaces/printer';

@Component({
  selector: 'app-printer-selector',
  templateUrl: './printer-selector.component.html',
  styleUrls: ['./printer-selector.component.css']
})
export class PrinterSelectorComponent {
  readonly KEY: string = 'PRINTER'
  printers: Printer[] = []
  selectedPrinter: Printer = InitEmptyPrinter()

  constructor(
    private settingService: SettingsService
  ) { }

  ngOnInit(): void {
    this.settingService.getPrinters().subscribe(printers => {
      this.printers = printers
      // Check if the selected printer is in data received from server
      let s = localStorage.getItem(this.KEY)
      if (s !== null && !printers.some(x => ArePrintersEqual(x, this.selectedPrinter)))
        this.changeSelectedPrinter(JSON.parse(s) as Printer)
      else
        this.changeSelectedPrinter(printers[0])
    })
  }

  changeSelectedPrinter(p: Printer): void {
    this.selectedPrinter = p
    localStorage.setItem(this.KEY, JSON.stringify(this.selectedPrinter))
  }

  getSelectedPrinter(): Printer {
    return this.selectedPrinter;
  }
}

import { Component } from '@angular/core';
import { arePrintersEqual, initEmptyPrinter, Printer } from '../interfaces/printer';
import { PrinterService } from '../services/printer.service';

@Component({
  selector: 'app-printer-selector',
  templateUrl: './printer-selector.component.html',
  styleUrls: ['./printer-selector.component.css']
})
export class PrinterSelectorComponent {
  readonly KEY: string = 'PRINTER'
  printers: Printer[] = []
  selectedPrinter: Printer = initEmptyPrinter()

  constructor(
    private printerService: PrinterService
  ) { }

  ngOnInit(): void {
    this.printerService.getPrinters().subscribe(printers => {
      this.printers = printers
      // Check if the selected printer is in data received from server
      let s = localStorage.getItem(this.KEY)
      if (s !== null && printers.some(x => arePrintersEqual(x, this.selectedPrinter)))
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

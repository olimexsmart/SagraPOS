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

  constructor(private printerService: PrinterService) { }

  ngOnInit(): void {
    this.printerService.getPrinters().subscribe(printers => {
      if (printers.length === 0)
        return
      // Save local reference
      this.printers = printers
      // Check if the selected printer is in data received from server
      let rawSavedPrinter = localStorage.getItem(this.KEY)
      if (rawSavedPrinter !== null) {
        let savedPrinter: Printer = JSON.parse(rawSavedPrinter)
        // Check if saved printer is still in the server
        if (printers.some(x => arePrintersEqual(x, savedPrinter))){
          this.changeSelectedPrinter(savedPrinter)
          return
        }
      }
      // Else nothing valid is saved, select the first one
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

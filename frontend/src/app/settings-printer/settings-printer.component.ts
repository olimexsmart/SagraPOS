import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Printer } from '../interfaces/printer';
import { PrinterService } from '../services/printer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-printer',
  templateUrl: './settings-printer.component.html',
  styleUrls: ['./settings-printer.component.css']
})
export class SettingsPrinterComponent implements OnInit {
  printer = new MatTableDataSource<Printer>();
  displayedColumns: string[] = ['name', 'ip', 'port', 'hidden'];
  private pin: number

  constructor(
    private printerService: PrinterService,
    private router: Router
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];
    if (this.pin === undefined)
      this.router.navigate(['settings'])
  }

  ngOnInit(): void {
    this.loadPrinters()
  }

  loadPrinters(): void {
    this.printerService.getPrinters().subscribe(data => {
      this.printer.data = data
    })
  }
}

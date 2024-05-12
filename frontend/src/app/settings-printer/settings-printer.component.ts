import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Printer } from '../interfaces/printer';
import { PrinterService } from '../services/printer.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings-printer',
  templateUrl: './settings-printer.component.html',
  styleUrls: ['./settings-printer.component.css']
})
export class SettingsPrinterComponent implements OnInit {
  printer = new MatTableDataSource<Printer>();
  displayedColumns: string[] = ['name', 'ip', 'port', 'hidden', 'actions'];
  private pin: number = 0
  scanning: boolean = false
  private defSnackConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'start'
  }

  constructor(
    private printerService: PrinterService,
    private router: Router,
    private snackBar: MatSnackBar
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

  deletePrinter(id: number) {
    this.printerService.deletePrinter(this.pin, id).subscribe(() => this.loadPrinters());
  }

  scanPrinters(port: number = 9100) {
    this.scanning = true
    this.printerService.scanPrinters(port).subscribe((data) => {
      if (data.length > 0) {
        this.snackBar.open('Numero stampanti trovate: ' + data.length, undefined, this.defSnackConfig);

        console.log(data);
        this.scanning = false
      } else {
        this.snackBar.open('Nessuna spampante trovata', undefined, this.defSnackConfig);
      }
    })
  }
}

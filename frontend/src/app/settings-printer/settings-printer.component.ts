import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PrinterExtra, ScanResult } from '../interfaces/printer';
import { PrinterService } from '../services/printer.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';


@Component({
  selector: 'app-settings-printer',
  templateUrl: './settings-printer.component.html',
  styleUrls: ['./settings-printer.component.css']
})
export class SettingsPrinterComponent implements OnInit {
  printers = new MatTableDataSource<PrinterExtra>();
  displayedColumns: string[] = ['name', 'ip', 'port', 'hidden', 'actions'];
  private pin: number = 0
  loading: boolean = false
  scanned: boolean = false
  editForm: FormGroup;

  ScanResult = ScanResult // Trick suggested by chatGPT to expose the enum to the template file

  private subCallBacks = {
    complete: () => {
      this.snackBar.showSuccess()
      this.loadPrinters()
    },
    error: () => {
      this.snackBar.showError()
      this.loading = false
    }
  };

  @ViewChild('editPrinterTemplate') editPrinterTemplate!: TemplateRef<any>;

  constructor(
    private printerService: PrinterService,
    private router: Router,
    private snackBar: EmojiSnackBarService,
    private fb: FormBuilder,
    public dialog: MatDialog,
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];
    if (this.pin === undefined)
      this.router.navigate(['settings'])

    this.editForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadPrinters()
    this.initForm()
  }

  initForm(printer?: any): void { // TODO use interface instead of any
    this.editForm = this.fb.group({
      id: [printer ? printer.id : null],
      name: [printer ? printer.name : '', Validators.required],
      ip: [printer ? printer.ip : '', Validators.required], // TODO ipv4 validator
      port: [printer ? printer.port : 9100, Validators.required],
      hidden: [printer ? printer.hidden : false]
    });
  }

  openDialog(category?: any): void {
    // Initialize form with category data if available, otherwise start fresh
    this.initForm(category);

    const dialogRef = this.dialog.open(this.editPrinterTemplate, {
      width: '250px',
      data: { form: this.editForm }
    });

    dialogRef.afterClosed().subscribe(() => {
      if (this.editForm.valid) {
        if (this.editForm.value.id) {
          this.updatePrinter();
        } else {
          this.insertPrinter();
        }
      }
    });
  }

  loadPrinters(): void {
    this.loading = true
    this.printerService.getPrinters().subscribe(data => {
      this.printers.data = data.map(p => ({
        id: p.id,
        name: p.name,
        ip: p.ip,
        port: p.port,
        hidden: p.hidden,
        scanResult: ScanResult.NotScanned
      }))
      this.scanned = false
      this.loading = false
    })
  }

  updatePrinter(): void {
    this.loading = true
    this.printerService.updatePrinter(this.pin, this.editForm.value)
      .subscribe(this.subCallBacks);
  }

  insertPrinter(printer?: PrinterExtra): void {
    this.loading = true
    if (printer) { // Found by scanning and saved
      this.printerService.insertPrinter(this.pin, printer)
        .subscribe({
          complete: () => {
            this.snackBar.showSuccess('Stampante aggiunta')
            printer.scanResult = ScanResult.Found
            this.loading = false
          },
          error: () => {
            this.snackBar.showError()
          }
        });
    }
    else // Manually inserted from editform
      this.printerService.insertPrinter(this.pin, this.editForm.value)
        .subscribe(this.subCallBacks);
  }

  deletePrinter(id: number) {
    this.loading = true
    this.printerService.deletePrinter(this.pin, id).subscribe(() => {
      this.printers.data = this.printers.data.filter(printer => printer.id !== id);
      this.loading = false
    });
  }

  scanPrinters(port: number = 9100) {
    this.loading = true
    this.printerService.scanPrinters(port).subscribe((foundPrinterIPs) => {
      if (foundPrinterIPs.length > 0) {
        this.snackBar.showSuccess('Numero stampanti trovate: ' + foundPrinterIPs.length)
        // Update scanning status of each printer
        let p = this.printers.data.map(p => {
          p.scanResult = foundPrinterIPs.includes(p.ip) ? ScanResult.Found : ScanResult.NotFound
          return p
        })
        // Add new printers
        for (const ip of foundPrinterIPs) {
          if (!p.some(printer => printer.ip === ip)) { // are new only if not already present
            p.push({
              id: 0,
              name: 'Printer' + ip.split('.')[3],
              ip: ip,
              port: port,
              hidden: false,
              scanResult: ScanResult.New
            })
          }
        }
        // Update table
        this.printers.data = p
        this.loading = false
        this.scanned = true
      } else {
        this.snackBar.showError('Nessuna spampante trovata')
        this.loading = false
        this.scanned = true
      }
    })
  }

  pokePrinter(printer: PrinterExtra) {
    this.printerService.pokePrinter(printer).subscribe({
      complete: () => this.snackBar.showSuccess('Stampa test inviata'),
      error: () => this.snackBar.showError('Errore in stampa test')
    })
  }

  printFakeOrder(printerID: number) {
    this.printerService.printFakeOrder(printerID).subscribe({
      complete: () => this.snackBar.showSuccess('Stampa test inviata'),
      error: () => this.snackBar.showError('Errore in stampa test')
    })
  }
}

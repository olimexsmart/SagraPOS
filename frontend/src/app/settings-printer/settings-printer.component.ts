import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PrinterExtra, ScanResult } from '../interfaces/printer';
import { PrinterService } from '../services/printer.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';


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
  private defSnackConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'start'
  }
  editForm: FormGroup;

  ScanResult = ScanResult // Trick suggested by chatGPT to expose the enum to the template file

  @ViewChild('editPrinterTemplate') editPrinterTemplate!: TemplateRef<any>;

  constructor(
    private printerService: PrinterService,
    private router: Router,
    private snackBar: MatSnackBar,
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
          this.createPrinter();
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
      .subscribe(() => this.loadPrinters());
  }

  createPrinter(printer?: PrinterExtra): void { // TODO not clear, split into two methods named differently
    this.loading = true
    if (printer) {
      this.printerService.insertPrinter(this.pin, printer)
        .subscribe(() => {
          this.snackBar.open('Stampante aggiunta', undefined, this.defSnackConfig)
          printer.scanResult = ScanResult.Found
          this.loading = false
        });
    }
    else
      this.printerService.insertPrinter(this.pin, this.editForm.value)
        .subscribe(() => this.loadPrinters());
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
        this.snackBar.open('Numero stampanti trovate: ' + foundPrinterIPs.length, undefined, this.defSnackConfig);
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
        this.snackBar.open('Nessuna spampante trovata', undefined, this.defSnackConfig);
      }
    })
  }
}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Printer } from '../interfaces/printer';
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
  printer = new MatTableDataSource<Printer>();
  displayedColumns: string[] = ['name', 'ip', 'port', 'hidden', 'actions'];
  private pin: number = 0
  scanning: boolean = false
  private defSnackConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'start'
  }
  editForm: FormGroup;

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

    // this.editForm = this.fb.group({
    //   id: [''],
    //   name: ['', Validators.required],
    //   ip: ['', Validators.required],
    //   port: ['', Validators.required],
    //   hidden: [false]
    // });
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
    this.printerService.getPrinters().subscribe(data => {
      this.printer.data = data
    })
  }

  updatePrinter(): void {
    this.printerService.updatePrinter(this.pin, this.editForm.value)
      .subscribe(() => this.loadPrinters());
  }

  createPrinter(): void {
    this.printerService.insertPrinter(this.pin, this.editForm.value)
      .subscribe(() => this.loadPrinters());
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

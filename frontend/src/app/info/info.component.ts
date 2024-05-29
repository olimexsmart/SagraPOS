import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Component, ViewChild } from '@angular/core';
import { InfoOrdersDTO } from '../interfaces/info-orders-dto';
import { InfoService } from '../services/info.service';
import { ConfirmDialogModel, DialogPinComponent } from '../dialog-pin/dialog-pin.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
  displayedColumns: string[] = ['menuEntryName', 'quantitySold', 'totalSold', 'totalSoldPercentage', 'totalPercentage'];
  infoOrders: InfoOrdersDTO;
  tableDataSource;
  @ViewChild(MatSort) sort: MatSort = null!;
  printerID: number = 0;
  loading: boolean = false

  constructor(
    private infoService: InfoService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: EmojiSnackBarService,
  ) {
    this.infoOrders = {
      infoOrderEntries: [],
      ordersTotal: 0,
      numOrders: 0
    }
    this.tableDataSource = new MatTableDataSource(this.infoOrders.infoOrderEntries)
  }

  ngOnInit(): void {
    this.refreshInfo()
    this.printerID = parseInt(this.route.snapshot.paramMap.get('printerID') ?? "0")
  }

  clearInfo(): void {
    const message = 'Tutti i dati andranno persi';
    const dialogData = new ConfirmDialogModel('Azzera info?', message);
    const dialogRef = this.dialog.open(DialogPinComponent, {
      maxWidth: '350px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      // TODO understand if instead of .value can be specified a strong type
      if (dialogResult.value === undefined) return
      this.infoService.resetInfoOrder(dialogResult.value).subscribe(
        {
          complete: () => {
            this.refreshInfo.bind(this) // Loved to know this hack by myself
            this.snackBar.showSuccess('Info cancellate OK')
            this.loading = false
          },
          error: () => {
            console.error
            this.loading = false
            this.snackBar.showError('Errore in cancellare info')
          }
        });
    });
  }

  printInfo(): void {
    this.loading = true
    this.infoService.printInfo(this.printerID).subscribe(
      {
        complete: () => {
          this.snackBar.showSuccess('Info stampate OK')
          this.loading = false
        },
        error: () => {
          this.snackBar.showError('Errore in stampare info')
          this.loading = false
        }
      });
  }

  private refreshInfo(): void {
    this.loading = true
    this.infoService.getInfoOrder().subscribe(infoOrders => {
      this.infoOrders = infoOrders
      this.tableDataSource = new MatTableDataSource(this.infoOrders.infoOrderEntries)
      this.loading = false
    })
  }
}

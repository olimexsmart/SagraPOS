import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { OrderComponent } from './order/order.component';
import { MatRippleModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { InfoComponent } from './info/info.component';
import { MatTableModule } from '@angular/material/table';
import { DialogPinComponent } from './dialog-pin/dialog-pin.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { A11yModule } from '@angular/cdk/a11y'
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { PrinterSelectorComponent } from './printer-selector/printer-selector.component';
import { MatBadgeModule } from '@angular/material/badge';
import { InventoryModeComponent } from './inventory-mode/inventory-mode.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogUpdateInventoryComponent } from './dialog-update-inventory/dialog-update-inventory.component'
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    MainComponent,
    InfoComponent,
    DialogPinComponent,
    PrinterSelectorComponent,
    InventoryModeComponent,
    DialogUpdateInventoryComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    MatBadgeModule,
    RouterModule.forRoot([
      // { path: '', component: HomeComponent, pathMatch: 'full' }, // TODO add 404 page
      { path: '', redirectTo: '/main', pathMatch: 'full' },
      // TODO animations on page change
      { path: 'main', component: MainComponent }, //, data: { animation: 'togglePage' } },
      { path: 'info/:printerID', component: InfoComponent } //, data: { animation: 'togglePage' } },
      // { path: '**', component: NotFoundComponent },
    ]),
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatSidenavModule,
    FormsModule,
    MatRippleModule,
    HttpClientModule,
    MatGridListModule,
    MatTableModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    A11yModule,
    MatSelectModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

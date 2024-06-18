import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import { MenuEntry } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';

interface MenuEntryExplicit { // TODO make this the common interface, populate using joins
  id: number
  category: MenuCategory
  printCategory: MenuCategory
  name: string
  printingName: string | null
  price: number
  inventory: number | null
  ordering: number
  hidden: boolean
  printSequenceEnable: boolean
}

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent implements OnInit {
  menuEntries = new MatTableDataSource<MenuEntryExplicit>();
  categories: MenuCategory[] = []
  printCategories: MenuCategory[] = []
  displayedColumns: string[] = [
    'name',
    'printingName',
    'categoryName',
    'printCategoryName',
    'price',
    'ordering',
    'actions'
  ];
  editForm: FormGroup;
  private pin: number
  loading: boolean = false
  private modifingID: number = 0

  private subCallBacks = {
    complete: () => {
      this.snackBar.showSuccess()
      this.loadMenuItems()
    },
    error: () => {
      this.snackBar.showError()
      this.loading = false
    }
  };

  @ViewChild('editCategoryTemplate') editCategoryTemplate!: TemplateRef<any>;

  constructor(
    private menuService: MenuService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: EmojiSnackBarService
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];

    if (this.pin === undefined)
      this.router.navigate(['settings'])

    this.editForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadMenuItems();
    this.initForm();
  }

  initForm(menuEntry?: MenuEntryExplicit): void {
    this.editForm = this.fb.group({
      id: [menuEntry ? menuEntry.id : null],
      categoryID: [menuEntry ? menuEntry.category.id : '', Validators.required],
      printCategoryID: [menuEntry ? menuEntry.printCategory.id : '', Validators.required],
      name: [menuEntry ? menuEntry.name : '', Validators.required],
      printingName: [menuEntry ? menuEntry.printingName : null],
      price: [menuEntry ? menuEntry.price : '', Validators.required],
      ordering: [menuEntry ? menuEntry.ordering : 0, Validators.required],
      inventory: [menuEntry ? menuEntry.inventory : null],
      hidden: [menuEntry ? menuEntry.hidden : false],
      printSequenceEnable: [menuEntry ? menuEntry.printSequenceEnable : false]
    });
  }

  loadMenuItems(): void {
    this.loading = true
    forkJoin({
      categories: this.menuService.getCategories(),
      printCategories: this.menuService.getPrintCategories(),
      menuEntries: this.menuService.getMenuEntries()
    }).pipe(
      map(({ categories, printCategories, menuEntries }) => {
        const menuEntriesExpl = menuEntries.map(me => ({
          id: me.id,
          category: categories.find(x => x.id === me.categoryID)!, // It's ok, it's a foreign key
          printCategory: printCategories.find(x => x.id === me.printCategoryID)!,
          name: me.name,
          printingName: me.printingName,
          price: me.price,
          inventory: me.inventory,
          ordering: me.ordering,
          hidden: me.hidden,
          printSequenceEnable: me.printSequenceEnable
        }));
        return { categories, printCategories, menuEntriesExpl };
      })
    ).subscribe({
      next: ({ categories, printCategories, menuEntriesExpl }) => {
        this.categories = categories;
        this.printCategories = printCategories;
        this.menuEntries.data = menuEntriesExpl;
        this.loading = false
      },
      error: () => {
        this.snackBar.showError()
        this.loading = false
      }
    })
  }


  openDialog(category?: any): void {
    // Initialize form with category data if available, otherwise start fresh
    this.initForm(category);

    const dialogRef = this.dialog.open(this.editCategoryTemplate, {
      width: '250px',
      data: { form: this.editForm }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => { // TODO uniform logic on other dialogs
      if (result && this.editForm.valid) {
        if (this.editForm.value.id) {
          this.updateMenuItem();
        } else {
          this.createMenuItem();
        }
      }
    });
  }

  updateMenuItem(): void {
    this.menuService.updateMenuEntry(this.pin, this.editForm.value)
      .subscribe(this.subCallBacks);
  }

  createMenuItem(): void {
    this.menuService.insertMenuEntry(this.pin, this.editForm.value)
      .subscribe(this.subCallBacks);
  }

  deleteMenuItem(id: number): void {
    this.menuService.deleteMenuEntry(this.pin, id)
      .subscribe(this.subCallBacks);
  }


  triggerFilePicker(id: number): void {
    this.modifingID = id
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jpg,.jpeg';
    fileInput.onchange = this.uploadDB.bind(this);
    fileInput.click();
  }

  private uploadDB(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Check if an image was selected and upload that
      this.menuService.uploadImage(this.pin, this.modifingID, file)
        .subscribe();
    }
  }
}


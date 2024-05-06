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

interface MenuEntryExplicit { // TODO make this the common interface, populate using joins
  id: number,
  category: MenuCategory,
  printCategory: MenuCategory
  name: string,
  printingName: string | null
  price: number,
  inventory: number | null
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
    'inventory',
    'actions'
  ];
  editForm: FormGroup;
  private pin: number

  @ViewChild('editCategoryTemplate') editCategoryTemplate!: TemplateRef<any>;

  constructor(
    private menuService: MenuService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router
  ) {
    // Accessing navigation state
    const navigation = this.router.getCurrentNavigation();
    this.pin = navigation?.extras.state?.['pin'];

    if (this.pin === undefined)
      this.router.navigate(['settings'])

    this.editForm = this.fb.group({
      // id: [''],
      // categoryID: [''],
      // printCategoryID: [''],
      // name: ['', Validators.required],
      // printingName: [''],
      // price: ['', Validators.required],
      // inventory: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }

  initForm(menuEntry?: MenuEntryExplicit): void {
    this.editForm = this.fb.group({
      id: [menuEntry ? menuEntry.id : null],
      categoryID: [menuEntry ? menuEntry.category.id : ''],
      printCategoryID: [menuEntry ? menuEntry.printCategory.id : '', Validators.required],
      name: [menuEntry ? menuEntry.name : '', Validators.required],
      printingName: [menuEntry ? menuEntry.printingName : ''],
      price: [menuEntry ? menuEntry.price : '', Validators.required],
      inventory: [menuEntry ? menuEntry.inventory : ''],
    });
  }

  loadCategories(): void {
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
          inventory: me.inventory
        }));
        return { categories, printCategories, menuEntriesExpl };
      })
    ).subscribe({
      next: ({ categories, printCategories, menuEntriesExpl }) => {
        this.categories = categories;
        this.printCategories = printCategories;
        this.menuEntries.data = menuEntriesExpl;
      },
      error: (err) => {
        console.error('Error loading data', err);
      }
    });
  }


  openDialog(category?: any): void {
    // Initialize form with category data if available, otherwise start fresh
    this.initForm(category);

    const dialogRef = this.dialog.open(this.editCategoryTemplate, {
      width: '250px',
      data: { form: this.editForm }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => { // TODO uniform logic
      if (result && this.editForm.valid) {
        if (this.editForm.value.id) {
          this.updateCategory();
        } else {
          this.createCategory();
        }
      }
    });
  }

  updateCategory(): void {
    this.menuService.updateMenuEntry(this.pin, this.editForm.value)
      .subscribe(() => this.loadCategories());
  }

  createCategory(): void {
    this.menuService.insertMenuEntry(this.pin, this.editForm.value)
      .subscribe(() => this.loadCategories());
  }

  deleteCategory(id: number): void {
    this.menuService.deleteMenuEntry(this.pin, id)
      .subscribe(() => this.loadCategories());
  }

}


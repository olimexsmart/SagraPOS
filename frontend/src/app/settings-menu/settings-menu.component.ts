import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import { MenuEntryDTO } from '../interfaces/menu-entry-dto';
import { MenuCategory } from '../interfaces/menu-categories';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface MenuEntryExplicitDTO {
  id: number,
  name: string,
  price: number,
  category: MenuCategory,
  printCategory: MenuCategory
}

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent implements OnInit {
  menuEntries = new MatTableDataSource<MenuEntryExplicitDTO>();
  categories: MenuCategory[] = []
  printCategories: MenuCategory[] = []
  displayedColumns: string[] = ['name', 'price', 'categoryName', 'printCategoryName', 'actions'];
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
      id: [''],
      name: ['', Validators.required],
      price: ['', Validators.required],
      categoryID: [''],
      printCategoryID: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }

  initForm(menuEntry?: MenuEntryExplicitDTO): void {
    this.editForm = this.fb.group({
      id: [menuEntry ? menuEntry.id : null],
      name: [menuEntry ? menuEntry.name : '', Validators.required],
      price: [menuEntry ? menuEntry.price : '', Validators.required], 
      categoryID: [menuEntry ? menuEntry.category.id : ''],
      printCategoryID: [menuEntry ? menuEntry.printCategory.id : '', Validators.required]
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
          name: me.name,
          price: me.price,
          category: categories.find(x => x.id === me.categoryID)!, // It's ok, it's a foreign key
          printCategory: printCategories.find(x => x.id === me.printCategoryID)!
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

    dialogRef.afterClosed().subscribe(() => {
      console.log(this.editForm.value);
      
      if (this.editForm.valid) {
        if (this.editForm.value.id) {
          this.updateCategory();
        } else {
          this.createCategory();
        }
      }
    });
  }

  updateCategory(): void {
    // (this.mode === Mode.Categories 
    //   ? this.menuService.updateCategory(this.pin, this.editForm.value)
    //   : this.menuService.updatePrintCategory(this.pin, this.editForm.value)
    // ).subscribe(() => this.loadCategories());
  }

  createCategory(): void {
    // (this.mode === Mode.Categories 
    //   ? this.menuService.insertCategory(this.pin, this.editForm.value)
    //   : this.menuService.insertPrintCategory(this.pin, this.editForm.value)
    // ).subscribe(() => this.loadCategories());
  }

  deleteCategory(id: number): void {
    // (this.mode === Mode.Categories 
    //   ? this.menuService.deleteCategory(this.pin, id)
    //   : this.menuService.deletePrintCategory(this.pin, id)
    // ).subscribe(() => this.loadCategories());
  }

}


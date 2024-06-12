import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MenuService } from '../services/menu.service';
import { MenuCategory } from '../interfaces/menu-categories';
import { Router } from '@angular/router';
import { EmojiSnackBarService } from '../classes/snack-bar-utils';

enum Mode { Categories, PrintCategories, Invalid }

@Component({
  selector: 'app-settings-categories',
  templateUrl: './settings-categories.component.html',
  styleUrls: ['./settings-categories.component.css']
})
export class SettingsCategoriesComponent implements OnInit {
  categories = new MatTableDataSource<MenuCategory>();
  displayedColumns: string[] = ['name', 'occurrences', 'ordering', 'actions'];
  editForm: FormGroup;
  private pin: number
  private mode: Mode
  loading: boolean = false

  private subCallBacks = {
    complete: () => {
      this.snackBar.showSuccess()
      this.loadCategories()
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
    let r = navigation?.extras.state?.['route'] as string
    this.mode = Mode.Invalid
    if (r === 'categories')
      this.mode = Mode.Categories
    else if (r === 'printCategories')
      this.mode = Mode.PrintCategories

    if (this.pin === undefined || this.mode === Mode.Invalid)
      this.router.navigate(['settings'])

    this.editForm = this.fb.group({
      id: [''],
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }

  initForm(category?: any): void { // TODO use interface instead of any
    this.editForm = this.fb.group({
      id: [category ? category.id : null],
      name: [category ? category.name : '', Validators.required],
      ordering: [category ? category.ordering : 0, Validators.required]
    });
  }

  loadCategories(): void {
    this.loading = true;

    (this.mode === Mode.Categories
      ? this.menuService.getCategories()
      : this.menuService.getPrintCategories()
    ).subscribe(data => {
      this.categories.data = data;
      this.loading = false
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
    this.loading = true;

    (this.mode === Mode.Categories
      ? this.menuService.updateCategory(this.pin, this.editForm.value)
      : this.menuService.updatePrintCategory(this.pin, this.editForm.value)
    ).subscribe(this.subCallBacks);
  }

  createCategory(): void {
    this.loading = true;

    (this.mode === Mode.Categories
      ? this.menuService.insertCategory(this.pin, this.editForm.value)
      : this.menuService.insertPrintCategory(this.pin, this.editForm.value)
    ).subscribe(this.subCallBacks);
  }

  deleteCategory(id: number): void {
    this.loading = true;

    (this.mode === Mode.Categories
      ? this.menuService.deleteCategory(this.pin, id)
      : this.menuService.deletePrintCategory(this.pin, id)
    ).subscribe(this.subCallBacks);
  }



}


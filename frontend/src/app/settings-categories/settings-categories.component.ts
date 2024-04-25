import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MenuService } from '../services/menu.service';
import { MenuCategory } from '../interfaces/menu-categories';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-settings-categories',
  templateUrl: './settings-categories.component.html',
  styleUrls: ['./settings-categories.component.css']
})
export class SettingsCategoriesComponent implements OnInit {
  categories = new MatTableDataSource<MenuCategory>();
  displayedColumns: string[] = ['name', 'occurrences', 'actions'];
  editForm: FormGroup;
  private pin: number = 0

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
      name: ['', Validators.required]
    });
  }

  // private getPinFromNavigation(event: NavigationStart) {
  //   const state = this.router.getCurrentNavigation()?.extras.state as {exampleData: string};
  //   if (state) {
  //     this.exampleData = state.exampleData;
  //   }
  // }

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();


  }

  initForm(category?: any): void {
    this.editForm = this.fb.group({
      id: [category ? category.id : null],
      name: [category ? category.name : '', Validators.required]
    });
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe(data => {
      this.categories.data = data;
    });
  }

  openDialog(category?: any): void {
    // Initialize form with category data if available, otherwise start fresh
    this.initForm(category);

    const dialogRef = this.dialog.open(this.editCategoryTemplate, {
      width: '250px',
      data: { form: this.editForm }
    });

    dialogRef.afterClosed().subscribe(result => {
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
    this.menuService.updateCategory(this.pin, this.editForm.value).subscribe(() => {
      this.loadCategories(); // Refresh the list
    });
  }

  createCategory(): void {
    this.menuService.insertCategory(this.pin, this.editForm.value).subscribe(() => {
      this.loadCategories(); // Refresh the list
    });
  }

  deleteCategory(id: number): void {
    this.menuService.deleteCategory(this.pin, id).subscribe(() => {
      this.loadCategories(); // Refresh the list after delete
    });
  }
}


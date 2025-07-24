import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '../../../../core/models/category.model';
import { NgForm } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
})
export class CategoryDialogComponent {
  @ViewChild('form') form!: NgForm;
  category: Category = { name: '', description: '', image_url: '' };
  isLoading = false;
  isEditing = false;

  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    if (data) {
      this.category = { ...data };
      this.isEditing = true;
    }
  }

  async onSave() {
    if (this.form.invalid) return;

    this.isLoading = true;

    try {
      const categoryData = {
        name: this.category.name,
        description: this.category.description,
        image_url: this.category.image_url,
      };

      let result;
      if (this.isEditing && this.category.id) {
        result = await this.categoryService.updateCategory(
          this.category.id,
          categoryData
        );
        this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', {
          duration: 3000,
        });
      } else {
        result = await this.categoryService.createNewCategory(categoryData);
        this.snackBar.open('Categoría creada correctamente', 'Cerrar', {
          duration: 3000,
        });
      }

      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      this.snackBar.open('Error: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading = false;
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

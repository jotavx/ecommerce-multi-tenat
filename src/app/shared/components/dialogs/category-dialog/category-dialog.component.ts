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

  selectedFile: File | null = null;
  loadingImage = false;

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

  // async onSave() {
  //   if (this.form.invalid) return;

  //   this.isLoading = true;

  //   try {
  //     const categoryData = {
  //       name: this.category.name,
  //       description: this.category.description,
  //       image_url: this.category.image_url,
  //     };

  //     let result;
  //     if (this.isEditing && this.category.id) {
  //       result = await this.categoryService.updateCategory(
  //         this.category.id,
  //         categoryData
  //       );
  //       this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', {
  //         duration: 3000,
  //       });
  //     } else {
  //       result = await this.categoryService.createNewCategory(categoryData);
  //       this.snackBar.open('Categoría creada correctamente', 'Cerrar', {
  //         duration: 3000,
  //       });
  //     }

  //     this.dialogRef.close(result);
  //   } catch (error) {
  //     console.error('Error al guardar la categoría:', error);
  //     this.snackBar.open('Error: ' + (error as Error).message, 'Cerrar', {
  //       duration: 5000,
  //       panelClass: ['error-snackbar'],
  //     });
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

  async onSave() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.loadingImage = true;

    try {
      if (this.selectedFile) {
        const imageUrl = await this.categoryService.uploadCategoryImage(
          this.selectedFile
        );
        this.category.image_url = imageUrl;
      }

      let result;
      if (this.isEditing && this.category.id) {
        result = await this.categoryService.updateCategory(
          this.category.id,
          this.category
        );
        this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', {
          duration: 3000,
        });
      } else {
        result = await this.categoryService.createNewCategory(this.category);
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
      this.loadingImage = false;
    }
  }

  async quitarImagen() {
    try {
      await this.categoryService.deleteCategoryImage(
        this.category.id,
        this.category.image_url
      );
      this.category.image_url = '';
      this.selectedFile = null;
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      this.snackBar.open('Error al eliminar la imagen', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const maxSizeInBytes = 10 * 1024 * 1024; //10MB

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (file.size > maxSizeInBytes) {
        this.snackBar.open('El archivo supera los 10MB.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
        input.value = '';
        return;
      }

      if (!validTypes.includes(file.type)) {
        this.snackBar.open('Solo se permiten JPG, PNG o WEBP.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
        input.value = '';
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.category.image_url = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

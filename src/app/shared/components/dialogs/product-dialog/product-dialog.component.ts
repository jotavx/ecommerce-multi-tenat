import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../../core/models/products.model';
import { CategoryService } from '../../../../core/services/category.service';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
})
export class ProductDialogComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  product: Product = {
    name: '',
    description: '',
    price: 0,
    image_url: '',
    stock: 0,
    category_id: '',
  };

  categories: any[] = [];
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    if (data) this.product = { ...data };
  }

  async ngOnInit() {
    this.loading = true;
    try {
      // Cambiamos getAllCategories() por getMyBusinessCategories()
      this.categories = await this.categoryService.getMyBusinessCategories();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.snackBar.open(
        'Error al cargar categorías: ' + (error as Error).message,
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    } finally {
      this.loading = false;
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.product);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

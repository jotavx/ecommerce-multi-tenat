import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../../core/models/products.model';
import { CategoryService } from '../../../../core/services/category.service';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../core/services/products.service';

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
    stock: 99,
    category_id: '',
  };

  categories: any[] = [];

  loading = false;
  loadingImage = false;

  constructor(
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {
    if (data) this.product = { ...data };
  }

  async ngOnInit() {
    this.loadingImage = true;
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
      this.loadingImage = false;
    }
  }

  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      // Validar tamaño
      if (file.size > maxSizeInBytes) {
        alert('El archivo supera el tamaño máximo permitido de 5MB.');
        input.value = '';
        return;
      }

      // Validar tipo
      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten archivos JPG, PNG o WEBP.');
        input.value = '';
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.product.image_url = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // onSave() {
  //   if (this.form.invalid) return;
  //   this.dialogRef.close(this.product);
  // }

  async onSave() {
    if (this.form.invalid) return;

    this.loading = true;

    try {
      if (this.selectedFile) {
        const imageUrl = await this.productService.uploadProductImage(
          this.selectedFile
        );
        this.product.image_url = imageUrl;
      }

      this.dialogRef.close(this.product);
    } catch (error) {
      this.snackBar.open(
        'Error al subir imagen: ' + (error as Error).message,
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    } finally {
      this.loading = false;
    }
  }

  async quitarImagen() {
    try {
      await this.productService.deleteProductImage(
        this.product.id,
        this.product.image_url
      );
      this.product.image_url = '';
    } catch (error) {
      console.error('Error al quitar imagen:', error);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

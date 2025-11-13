import { Component, HostListener, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/products.service';
import { Product } from '../../core/models/products.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { ProductDialogComponent } from '../../shared/components/dialogs/product-dialog/product-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.css'],
})
export class ProductManagerComponent implements OnInit {
  searchTerm: string = '';
  products: Product[] = [];
  loading = false;
  openDropdownId: string | null = null;
  itemsPerPage = 10;
  currentPage = 1;
  brand: string | null = null;
  imageUrl: any;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.brand = params.get('brand') || '';
    });
    await this.loadProducts();
  }

  async loadProducts() {
    this.loading = true;
    try {
      this.products = await this.productService.getProductsByBusinessForAdmin();
    } catch (error) {
      console.error('Error al obtener productos:', error);
      this.showError('Error al cargar productos: ' + (error as Error).message);
    } finally {
      this.loading = false;
    }
  }

  filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase().trim();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.categories?.name?.toLowerCase().includes(term) ?? false)
    );
  }

  async openProductDialog(product?: Product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product || null,
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result: Product | null) => {
      if (result) {
        try {
          if (result.id) {
            await this.productService.updateProduct(result.id, result);
            this.showSuccess('Producto actualizado correctamente');
          } else {
            await this.productService.createProduct(result);
            this.showSuccess('Producto creado correctamente');
          }
          await this.loadProducts();
        } catch (error) {
          this.showError(
            'Error al guardar producto: ' + (error as Error).message
          );
        }
      }
    });
  }

  async deleteProduct(id: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar producto',
      message:
        '¿Estás seguro que quieres eliminar este producto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          // 1️⃣ Obtener URL o path de la imagen
          const imageResult = await this.productService.getImageUrl(id);
          const imageUrl = imageResult?.imageUrl; // puede ser null o undefined

          // 2️⃣ Eliminar producto (y si corresponde, la imagen)
          await this.productService.deleteProduct(id, imageUrl);

          // 3️⃣ Actualizar la lista local
          this.products = this.products.filter((p) => p.id !== id);

          // 4️⃣ Notificación de éxito
          this.showSuccess('Producto eliminado correctamente');
        } catch (error) {
          this.showError(
            'Error al eliminar producto: ' + (error as Error).message
          );
        }
      }
    });
  }

  // async deleteProduct(id: string) {
  //   const dialogData: ConfirmDialogData = {
  //     title: 'Eliminar producto',
  //     message:
  //       '¿Estás seguro que quieres eliminar este producto? Esta acción no se puede deshacer.',
  //     confirmText: 'Eliminar',
  //     cancelText: 'Cancelar',
  //   };

  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '400px',
  //     data: dialogData,
  //   });

  //   dialogRef.afterClosed().subscribe(async (result) => {
  //     if (result) {
  //       try {
  //         await this.productService.deleteProduct(id);
  //         this.products = this.products.filter((p) => p.id !== id);
  //         this.showSuccess('Producto eliminado correctamente');
  //       } catch (error) {
  //         this.showError(
  //           'Error al eliminar producto: ' + (error as Error).message
  //         );
  //       }
  //     }
  //   });
  // }

  // Métodos de UI
  toggleDropdown(id: string) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  selectOption() {
    this.openDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  closeAllOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside =
      target.closest('[id^="dropdownButton-"]') ||
      target.closest('.dropdown-menu');
    if (!clickedInside) {
      this.openDropdownId = null;
    }
  }

  // Métodos de paginación
  paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts().slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  isNearBottom(product: Product): boolean {
    const index = this.paginatedProducts().findIndex(
      (p) => p.id === product.id
    );
    return index >= this.paginatedProducts().length - 2;
  }

  // Helpers para notificaciones
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}

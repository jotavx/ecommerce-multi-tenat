import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css'],
})
export class CategoriesListComponent implements OnInit {
  groupedProducts: Record<
    string,
    {
      image: string;
      categoryId: string;
      isOwned?: boolean;
    }
  > = {};

  loading = false;
  currentCategoryId: string | null = null;

  brand: string | null = null;
  businessId: string | null = null;

  constructor(
    private categoryService: CategoryService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.brand = params.get('brand') || '';
      // console.warn('Brand en categories-list:', this.brand);

      if (this.brand) {
        this.businessService
          .getBusinessId(this.brand)
          .then((result) => {
            this.businessId = result;
            this.loadCategories();
          })
          .catch((error) => {
            console.log('Error en ngOnInit:', error);
          });
      } else {
        console.warn('No se encontró la marca en la ruta.');
      }
    });
  }

  async loadCategories() {
    if (!this.businessId) {
      console.warn('No hay businessId disponible');
      return;
    }

    this.loading = true;
    try {
      this.groupedProducts = await this.categoryService.getGroupedCategories(
        this.businessId
      );
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      this.showError('Error al cargar categorías: ' + (error as Error).message);
    } finally {
      this.loading = false;
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  async handleRefresh() {
    await this.loadCategories();
  }

  objectKeys = Object.keys;
}

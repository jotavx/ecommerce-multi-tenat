import { Component } from '@angular/core';
import { ProductService } from '../../core/services/products.service';
import { Product } from '../../core/models/products.model';
import { CategoryService } from '../../core/services/category.service';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  loading = false;
  products: Product[] = [];
  categoryName = '';
  searchTerm: string = '';
  brand: string | null = '';
  businessId: string | null = null;

  constructor(
    private productService: ProductService,
    private businessService: BusinessService,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    this.loading = true;

    try {
      const brand = await this.obtenerBrand();
      if (brand) {
        this.businessId = await this.businessService.getBusinessId(brand);
      }

      const categoryId = this.route.snapshot.paramMap.get('id');
      if (categoryId) {
        const result = await this.categoryService.getProductsByCategory(
          categoryId,
          this.businessId || null
        );

        this.products = result.products;
        this.categoryName = result.name;
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.loading = false;
    }
  }

  async obtenerBrand(): Promise<string> {
    const params = await firstValueFrom(this.route.paramMap);
    const brand = params.get('brand') || '';
    this.brand = brand;
    return brand;
  }

  // obtenerBrand() {
  //   this.route.paramMap.subscribe((params) => {
  //     this.brand = params.get('brand') || '';
  //     console.warn('Brand en categories-list:', this.brand);
  //   });
  // }

  // async ngOnInit() {
  //   this.loading = true;
  //   this.obtenerBrand();

  //   try {
  //     if (this.brand) {
  //       this.businessId = await this.businessService.getBusinessId(this.brand);
  //     }

  //     const categoryId = this.route.snapshot.paramMap.get('id');
  //     if (categoryId) {
  //       const result = await this.categoryService.getProductsByCategory(
  //         categoryId,
  //         this.businessId || null
  //       );

  //       this.products = result.products;
  //       this.categoryName = result.name;
  //     }
  //   } catch (error) {
  //     console.error('Error al cargar productos:', error);
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  async getProducts() {
    this.loading = true;
    try {
      this.products = await this.productService.getProductsByBusiness(
        this.businessId || ''
      );
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      this.loading = false;
    }
  }

  filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.categories?.name?.toLowerCase().includes(term) ?? false)
    );
  }

  goBack() {
    history.back();
  }
}

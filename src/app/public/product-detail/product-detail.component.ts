import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/products.service';
import { Product } from '../../core/models/products.model';
import { CartService } from '../../core/services/cart.service';
import { VariantsProducts } from '../../core/services/variants-products.service';
import { BusinessService } from '../../core/services/business.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  loading = false;
  quantity = 1;
  observation: string = '';

  variants: any[] = [];
  choices: any[] = [];
  selectedVariants: { [key: string]: any } = {};
  selectedOptions: { [key: string]: any } = {};

  brand: string | null = '';
  businessId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private businessService: BusinessService,
    private variantsService: VariantsProducts
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.brand = params.get('brand') || '';
      // console.warn('Brand en product-detail:', this.brand);

      if (this.brand) {
        try {
          this.businessId = await this.businessService.getBusinessId(
            this.brand
          );
        } catch (error) {
          console.log('Error obteniendo businessId:', error);
        }
      }

      const id = params.get('id');
      if (id) {
        this.loading = true;
        try {
          this.product = await this.productService.getProductById(id);
          if (this.product) {
            this.variants = await this.variantsService.getVariantsByProduct(id);
            this.choices = await this.variantsService.getChoicesByProduct(id);
          }
        } catch (error) {
          console.error('Error loading product:', error);
        } finally {
          this.loading = false;
        }
      }
    });
  }

  // async ngOnInit() {
  //   this.obtenerBrand();
  //   if (this.brand) {
  //     this.businessService
  //       .getBusinessId(this.brand)
  //       .then((result) => {
  //         this.businessId = result;
  //       })
  //       .catch((error) => {
  //         console.log('Error en ngOnInit:', error);
  //       });
  //   }

  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) {
  //     this.loading = true;
  //     try {
  //       this.product = await this.productService.getProductById(id);
  //       if (this.product) {
  //         this.variants = await this.variantsService.getVariantsByProduct(id);
  //         this.choices = await this.variantsService.getChoicesByProduct(id);
  //       }
  //     } catch (error) {
  //       console.error('Error loading product:', error);
  //     } finally {
  //       this.loading = false;
  //     }
  //   }
  // }

  // obtenerBrand() {
  //   this.route.paramMap.subscribe((params) => {
  //     this.brand = params.get('brand') || '';
  //     console.warn('Brand en product-detail:', this.brand);
  //   });
  // }

  toggleVariant(variant: any) {
    if (this.selectedVariants[variant.id]) {
      delete this.selectedVariants[variant.id];
    } else {
      this.selectedVariants = {};
      this.selectedVariants[variant.id] = variant;
    }
  }

  toggleOption(choice: any, option: any) {
    const choiceId = choice.id;
    if (option.stock === true) return;
    if (choice.seleccionMultiple) {
      this.selectedOptions[choiceId] = this.selectedOptions[choiceId] || [];

      const index = this.selectedOptions[choiceId].findIndex(
        (opt: any) => opt.id === option.id
      );

      if (index > -1) {
        this.selectedOptions[choiceId].splice(index, 1);
        if (this.selectedOptions[choiceId].length === 0) {
          delete this.selectedOptions[choiceId];
        }
      } else {
        const currentTotal = this.getTotalSelectedForChoice(choiceId);
        if (
          option.counter &&
          choice.maxQuantity != null &&
          currentTotal >= choice.maxQuantity
        ) {
          return;
        }

        const optWithQty = { ...option };
        if (option.counter) optWithQty.quantity = 1;
        this.selectedOptions[choiceId].push(optWithQty);
      }
    } else {
      if (this.selectedOptions[choiceId]?.id === option.id) {
        delete this.selectedOptions[choiceId];
      } else {
        this.selectedOptions[choiceId] = option.counter
          ? { ...option, quantity: 1 }
          : option;
      }
    }
  }

  updateCounter(choiceId: string, optionId: string, delta: number) {
    const selected = this.selectedOptions[choiceId] || [];
    const choice = this.choices.find((c) => c.id === choiceId);
    if (!choice || !choice.seleccionMultiple) return;

    let option = selected.find((o: any) => o.id === optionId);
    if (!option) return;

    const currentTotal = this.getTotalSelectedForChoice(choiceId);

    if (
      delta > 0 &&
      choice.maxQuantity != null &&
      currentTotal >= choice.maxQuantity
    ) {
      return;
    }

    option.quantity = Math.max(1, (option.quantity || 1) + delta);
  }

  calculateTotalPrice(): number {
    if (!this.product) return 0;
    let total =
      Object.keys(this.selectedVariants).length === 0 ? this.product.price : 0;

    Object.values(this.selectedVariants).forEach((variant) => {
      total += variant.custom_price || variant.price || 0;
    });

    Object.values(this.selectedOptions).forEach((selected: any) => {
      if (Array.isArray(selected)) {
        selected.forEach((opt: any) => {
          const qty = opt.counter ? opt.quantity || 1 : 1;
          total += (opt.price || 0) * qty;
        });
      } else {
        const qty = selected.counter ? selected.quantity || 1 : 1;
        total += (selected.price || 0) * qty;
      }
    });

    return total * this.quantity;
  }

  decrementQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  incrementQuantity() {
    this.quantity += 1;
  }

  canAddToCart(): boolean {
    if (
      this.variants.length > 0 &&
      Object.keys(this.selectedVariants).length === 0
    ) {
      return false;
    }
    for (const choice of this.choices) {
      const selected = this.selectedOptions[choice.id];
      const total = this.getTotalSelectedForChoice(choice.id);

      // Validar si es obligatorio
      if (choice.obligatorio) {
        if (!selected || total === 0) {
          return false;
        }
      }

      // Validar selección múltiple con máximo
      if (choice.seleccionMultiple && choice.maxQuantity != null) {
        const requiereMax = !!choice.requerirMaxParaContinuar;

        if (requiereMax && total !== choice.maxQuantity) {
          return false;
        }

        if (!requiereMax && total > choice.maxQuantity) {
          return false;
        }
      }
    }

    return true;
  }

  async addToCart() {
    if (!this.product) return;
    const selectedOptionsFlat = Object.values(this.selectedOptions).flatMap(
      (opt) => (Array.isArray(opt) ? opt : [opt])
    );

    const cartItem: any = {
      product_id: this.product.id,
      product: this.product,
      quantity: this.quantity,
      selectedVariants: Object.values(this.selectedVariants),
      selectedOptions: selectedOptionsFlat,
      total_price: this.calculateTotalPrice(),
      observation: this.observation.trim() || null,
    };

    try {
      await this.cartService.addToCart(cartItem, this.businessId);
      // await this.cartService.addToCart(cartItem);
      this.router.navigate([`/tienda/${this.brand}/cart`]);
    } catch (error) {
      console.error(error);
    }
  }

  goBack() {
    history.back();
  }

  isOptionSelected(choice: any, option: any): boolean {
    const selected = this.selectedOptions[choice.id];
    if (!selected) return false;
    return choice.seleccionMultiple
      ? selected.some((opt: any) => opt.id === option.id)
      : selected.id === option.id;
  }

  getOptionQuantity(choiceId: string, optionId: string): number {
    const selected = this.selectedOptions[choiceId];
    if (!selected) return 0;
    if (Array.isArray(selected)) {
      const found = selected.find((o: any) => o.id === optionId);
      return found?.quantity || 0;
    }

    return selected.quantity || 0;
  }

  getTotalSelectedForChoice(choiceId: string): number {
    const selected = this.selectedOptions[choiceId];
    if (!selected) return 0;
    if (Array.isArray(selected)) {
      return selected.reduce((sum, opt: any) => sum + (opt.quantity || 1), 0);
    }

    return selected.quantity || 1;
  }
}

import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  loading = false;
  cartItems: CartItem[] = [];
  brand: string = '';
  businessId: string | null = null;

  constructor(
    private cartService: CartService,
    private businessService: BusinessService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;

    this.brand = this.route.snapshot.paramMap.get('brand') || '';

    if (!this.brand) {
      console.warn('No se encontró brand en la URL: cart.component');
      this.loading = false;
      return;
    }

    try {
      this.businessId = await this.businessService.getBusinessId(this.brand);

      if (!this.businessId) {
        console.error('No se pudo obtener el businessId');
        this.loading = false;
        return;
      }

      this.cartService.loadCart(this.businessId);

      this.cartService.getCart().subscribe((items) => {
        this.cartItems = items;
        this.loading = false;
      });
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      this.loading = false;
    }
  }

  // async ngOnInit(): Promise<void> {
  //   this.loading = true;

  //   // 1. Obtener el brand de la ruta
  //   this.brand = this.route.snapshot.paramMap.get('brand') || '';

  //   if (this.brand) {
  //     try {
  //       // 2. Obtener businessId (esperamos a que resuelva)
  //       this.businessId = await this.businessService.getBusinessId(this.brand);

  //       // 3. Cargar el carrito con el businessId válido
  //       this.cartService.loadCart(this.businessId);

  //       // 4. Suscribirse a los cambios del carrito (ahora businessId existe)
  //       this.cartService.getCart().subscribe((items) => {
  //         this.cartItems = items;
  //         this.loading = false;
  //       });
  //     } catch (error) {
  //       console.error('Error al cargar el carrito:', error);
  //       this.loading = false;
  //     }
  //   } else {
  //     console.warn('No se encontró brand en la URL');
  //     this.loading = false;
  //   }
  // }

  // obtenerBrand() {
  //   this.route.paramMap.subscribe((params) => {
  //     this.brand = params.get('brand') || '';
  //     if (this.businessId) {
  //       this.cartService.loadCart(this.businessId);
  //     } else {
  //       console.log('No se ha encontrado la marca en la ruta');
  //     }
  //     console.warn('Brand en carrito:', this.brand);
  //   });
  // }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return (
        sum + (item.total_price ?? item.quantity * (item.product?.price || 0))
      );
    }, 0);
  }

  remove(item: CartItem, index: number) {
    this.cartService.removeFromCart(index, this.businessId);
  }

  clearCart(redirect?: string) {
    this.cartService.clearCart(this.businessId, redirect);
  }

  async checkout() {
    this.router.navigate(['/checkout']);
  }
}

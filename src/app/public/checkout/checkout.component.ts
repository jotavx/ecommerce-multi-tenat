// checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  ubicacionGenerada: string | null = null;
  metodoPago = 'efectivo';
  formData = { nombre: '', telefono: '', direccion: '', ubicacionLink: '' };
  isLoading = false;
  isGettingLocation = false;

  brand: string | null = '';
  businessId: string | null = null;
  cartItems: CartItem[] = [];
  total: number = 0;

  terms = {
    item1: false,
  };

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cartService: CartService,
    private businessService: BusinessService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      let route = this.route;
      while (route.firstChild) route = route.firstChild;
      const params = await firstValueFrom(route.paramMap);
      this.brand = params.get('brand') || '';
      if (!this.brand)
        throw new Error('No se pudo obtener la marca desde la URL');
      this.businessId = await this.businessService.getBusinessId(this.brand);
      if (!this.businessId)
        throw new Error('No se pudo obtener el ID del negocio');

      this.cartService.loadCart(this.businessId);

      this.cartService.getCart().subscribe((items) => {
        this.cartItems = items;
        this.total = this.cartItems.reduce(
          (sum, item) =>
            sum +
            (item.total_price ?? item.quantity * (item.product?.price || 0)),
          0
        );
      });

      const storedData = localStorage.getItem('guestData');
      if (storedData) this.formData = JSON.parse(storedData);
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      alert(error instanceof Error ? error.message : 'Error general');
    }
  }

  get allTermsAccepted(): boolean {
    return this.terms.item1;
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    this.isGettingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        this.ubicacionGenerada = link;
        this.formData.ubicacionLink = link;
        this.isGettingLocation = false;
      },
      (error) => {
        console.error('Error obteniendo la ubicación:', error);
        alert('No se pudo obtener la ubicación.');
        this.isGettingLocation = false;
      }
    );
  }

  async onSubmit() {
    if (!this.businessId) {
      alert('No se pudo identificar el negocio');
      return;
    }

    const { nombre, telefono, direccion } = this.formData;
    if (!nombre || !telefono || !direccion) {
      alert('Debés completar todos los campos');
      return;
    }

    this.isLoading = true;

    try {
      localStorage.setItem(
        'guestData',
        JSON.stringify({ nombre, telefono, direccion })
      );

      await this.cartService.checkoutGuest({
        nombre,
        telefono,
        direccion,
        businessId: this.businessId,
        comprobanteUrl: 'No aplica',
        ubicacionLink: this.formData.ubicacionLink || '',
      });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : 'Error al confirmar el pedido'
      );
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    history.back();
  }
}

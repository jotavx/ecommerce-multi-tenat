import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../../core/services/supabase.service';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout-form',
  templateUrl: './checkout-form.component.html',
})

//COMPONENTE CHECKOUT CON CARGA DE COMPROBANTE
export class CheckoutFormComponent {
  // aliasTransferencia: string = '';
  // ubicacionGenerada: string | null = null;
  // formData = { nombre: '', telefono: '', direccion: '', ubicacionLink: '' };
  // isLoading = false;
  // file!: File;
  // brand: string | null = '';
  // businessId: string | null = null;
  // cartItems: CartItem[] = [];
  // total: number = 0;
  // terms = {
  //   item1: false,
  //   item2: false,
  // };
  // constructor(
  //   private supabase: SupabaseService,
  //   private authService: AuthService,
  //   private cartService: CartService,
  //   private businessService: BusinessService,
  //   private route: ActivatedRoute
  // ) {}
  // async ngOnInit() {
  //   try {
  //     // Obtener brand desde paramMap de forma segura
  //     let route = this.route;
  //     while (route.firstChild) {
  //       route = route.firstChild;
  //     }
  //     const params = await firstValueFrom(route.paramMap);
  //     this.brand = params.get('brand') || '';
  //     // console.warn('Brand en checkout:', this.brand);
  //     if (!this.brand) {
  //       throw new Error('No se pudo obtener la marca desde la URL');
  //     }
  //     // Obtener businessId
  //     this.businessId = await this.businessService.getBusinessId(this.brand);
  //     if (!this.businessId) {
  //       throw new Error('No se pudo obtener el ID del negocio');
  //     }
  //     // Cargar carrito
  //     this.cartService.loadCart(this.businessId);
  //     // Obtener alias del administrador
  //     this.aliasTransferencia =
  //       (await this.authService.getAdminAlias(this.brand)) || 'no disponible';
  //     // Suscripción al carrito
  //     this.cartService.getCart().subscribe((items) => {
  //       this.cartItems = items;
  //       this.total = this.cartItems.reduce((sum, item) => {
  //         return (
  //           sum +
  //           (item.total_price ?? item.quantity * (item.product?.price || 0))
  //         );
  //       }, 0);
  //     });
  //     // Datos del localStorage
  //     const storedData = localStorage.getItem('guestData');
  //     if (storedData) {
  //       this.formData = JSON.parse(storedData);
  //     }
  //   } catch (error) {
  //     console.error('Error en ngOnInit:', error);
  //     alert(error instanceof Error ? error.message : 'Error general');
  //   }
  // }
  // obtenerBrand() {
  //   this.route.paramMap.subscribe((params) => {
  //     this.brand = params.get('brand') || '';
  //     console.warn('Brand en checkout:', this.brand);
  //     // Si querés actualizar alias cuando cambie brand:
  //     if (this.brand) {
  //       this.authService.getAdminAlias(this.brand).then((alias) => {
  //         this.aliasTransferencia = alias || 'no disponible';
  //       });
  //     }
  //   });
  // }
  // get allTermsAccepted(): boolean {
  //   return this.terms.item1 && this.terms.item2;
  // }
  // onFileSelected(event: any) {
  //   this.file = event.target.files[0];
  // }
  // async onSubmit() {
  //   if (!this.file) {
  //     alert('Debés subir el comprobante.');
  //     return;
  //   }
  //   this.isLoading = true;
  //   try {
  //     if (!this.businessId) {
  //       throw new Error('No se pudo identificar el negocio');
  //     }
  //     // Subir comprobante y completar compra...
  //     const fileName = `${uuidv4()}-${this.file.name}`;
  //     const { error } = await this.supabase
  //       .getClient()
  //       .storage.from('comprobantes')
  //       .upload(fileName, this.file);
  //     if (error) throw error;
  //     const { publicUrl } = this.supabase
  //       .getClient()
  //       .storage.from('comprobantes')
  //       .getPublicUrl(fileName).data;
  //     // Validar campos obligatorios
  //     const { nombre, telefono, direccion } = this.formData;
  //     if (!nombre || !telefono || !direccion) {
  //       throw new Error('Debés completar todos los campos');
  //     }
  //     localStorage.setItem(
  //       'guestData',
  //       JSON.stringify({
  //         nombre,
  //         telefono,
  //         direccion,
  //       })
  //     );
  //     await this.cartService.checkoutGuest({
  //       nombre,
  //       telefono,
  //       direccion,
  //       businessId: this.businessId,
  //       comprobanteUrl: publicUrl,
  //       ubicacionLink: this.formData.ubicacionLink || '',
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     alert(
  //       err instanceof Error ? err.message : 'Error al completar la compra'
  //     );
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }
  // isGettingLocation = false;
  // obtenerUbicacionActual() {
  //   if (!navigator.geolocation) {
  //     alert('Tu navegador no soporta geolocalización.');
  //     return;
  //   }
  //   this.isGettingLocation = true;
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const lat = position.coords.latitude;
  //       const lng = position.coords.longitude;
  //       const link = `https://www.google.com/maps?q=${lat},${lng}`;
  //       this.ubicacionGenerada = link;
  //       this.formData.ubicacionLink = link;
  //       this.isGettingLocation = false;
  //     },
  //     (error) => {
  //       console.error('Error obteniendo la ubicación:', error);
  //       alert(
  //         'No se pudo obtener la ubicación. Asegurate de permitir el acceso al GPS.'
  //       );
  //       this.isGettingLocation = false;
  //     }
  //   );
  // }
  // goBack() {
  //   history.back();
  // }
}

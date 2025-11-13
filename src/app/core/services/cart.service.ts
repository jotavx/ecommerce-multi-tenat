import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]); // representa el carrito actual como un flujo reactivo
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async loadCart(businessId: string | null) {
    // Leer todos los ítems del carrito desde localStorage
    const allItems: CartItem[] = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const filteredItems = allItems.filter(
      (item) => item.business_id === businessId
    );

    // Actualizar observable
    this.cartItems$.next(filteredItems);
  }

  async addToCart(cartItem: CartItem, businessId: string | null) {
    const productId = cartItem.product_id || cartItem.product?.id;
    const variant_ids = cartItem.selectedVariants?.map((v) => v.id) || [];
    const option_ids = cartItem.selectedOptions?.map((o) => o.id) || [];
    const total_price = cartItem.total_price;

    if (!productId) {
      console.error('❌ Error: producto sin ID');
      return;
    }

    // Obtener carrito actual desde el observable
    const cart = this.cartItems$.value;

    // Agregar nuevo ítem (siempre como ítem separado)
    cart.push({
      product_id: productId,
      product: cartItem.product,
      quantity: cartItem.quantity,
      variant_ids,
      option_ids,
      total_price,
      selectedVariants: cartItem.selectedVariants,
      selectedOptions: cartItem.selectedOptions,
      observation: cartItem.observation,
      business_id: businessId,
    });

    // Guardar y actualizar el observable
    this.updateLocalCart(cart);

    // console.log('✅ Producto agregado al carrito local:', cartItem);

    await this.refreshCartItemCount(businessId || '');
    await this.loadCart(businessId || '');
  }

  // Devuelve el observable del carrito

  getCart() {
    return this.cartItems$.asObservable();
  }

  // Contador de ítems del carrito
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  async refreshCartItemCount(businessId: string | null) {
    const count = await this.getCartItemCount(businessId);
    this.cartCount.next(count);
  }

  async getCartItemCount(businessId: string | null): Promise<number> {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const filteredCart = localCart.filter(
      (item: any) => item.business_id === businessId
    );

    // Sumar cantidades
    return filteredCart.reduce((total: number, item: any) => {
      return total + (item.quantity || 0);
    }, 0);
  }

  // Guarda el carrito y actualiza el estado observable

  private updateLocalCart(items: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItems$.next(items);
  }

  async removeFromCart(index: number, businessId: string | null) {
    // Obtener todos los ítems del carrito
    const fullCart: CartItem[] = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const businessCart = fullCart.filter(
      (item) => item.business_id === businessId
    );

    // Eliminar el ítem de esa marca según índice
    businessCart.splice(index, 1);

    // Unir los ítems de otras marcas que no deben tocarse
    const otherItems = fullCart.filter(
      (item) => item.business_id !== businessId
    );
    const updatedCart = [...otherItems, ...businessCart];

    this.updateLocalCart(updatedCart);
    await this.refreshCartItemCount(businessId);
  }

  async clearCart(businessId: string | null, redirectTo?: string) {
    const fullCart: CartItem[] = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const remainingItems = fullCart.filter(
      (item) => item.business_id !== businessId
    );

    this.updateLocalCart(remainingItems);
    this.cartItems$.next([]);

    await this.refreshCartItemCount(businessId || '');

    if (redirectTo) {
      this.router.navigate([redirectTo]);
    }
  }

  async checkoutGuest(cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
    businessId: string;
    metodoPago: string | null;
    formaEntrega: string | null;
    ubicacionLink?: string;
  }) {
    const cartItems = this.cartItems$.value;
    if (cartItems.length === 0) return;

    // Verificar stock
    for (const item of cartItems) {
      const { data: product, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (error || !product || product.stock < item.quantity) {
        alert(`No hay suficiente stock para el producto ${product?.name}`);
        return;
      }
    }

    // Generar código
    const codigo =
      'P-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    // Calcular total
    const total = cartItems.reduce((sum, i) => sum + (i.total_price ?? 0), 0);

    // 1. Insertar el pedido SIN select
    const { error: orderError } = await this.supabase.from('orders').insert({
      codigo_seguimiento: codigo,
      total,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ubicacion_link: cliente.ubicacionLink,
      business_id: cliente.businessId,
      metodo_pago: cliente.metodoPago,
      forma_entrega: cliente.formaEntrega,
    });

    if (orderError) {
      console.error(orderError, cliente.businessId);
      alert('Error al crear el pedido');
      return;
    }

    // 2. Buscar el pedido recién insertado por código (que es único)
    const { data: order, error: fetchError } = await this.supabase
      .from('orders')
      .select('id') // solo necesitás el ID
      .eq('codigo_seguimiento', codigo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(); // <- usás single porque esperás 1 resultado

    if (fetchError || !order) {
      alert('No se pudo recuperar el pedido recién creado');
      return;
    }

    // 4. Agregar ítems y actualizar stock
    for (const item of cartItems) {
      const { error: itemError } = await this.supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.total_price,
          variant_ids: item.selectedVariants?.map((v) => v.id) || [],
          option_ids: item.selectedOptions?.map((o) => o.id) || [],
          selected_variants: item.selectedVariants || [],
          selected_options: item.selectedOptions || [],
          observation: item.observation,
          business_id: cliente.businessId,
        });

      if (itemError) {
        alert('Error al registrar ítems del pedido');
        return;
      }

      //Función para decrementar stock (todavía no creada en supabase)
      // await this.supabase.rpc('decrement_product_stock', {
      //   product_id_input: item.product_id,
      //   quantity_input: item.quantity,
      // });
    }

    // Obtener nombre del negocio
    const { data: name, error: nameError } = await this.supabase
      .from('business')
      .select('nombre_negocio')
      .eq('id', cliente.businessId)
      .limit(1)
      .single();

    if (nameError || !name) {
      alert('No se pudo recuperar el nombre del negocio');
      return;
    }

    const businessName: string = name.nombre_negocio;

    // 5. Guardar los códigos de seguimiento de localStorage en un array
    // y agregar el nuevo código generado
    const codigosGuardados: {
      codigo: string;
      fechaCreacion: string;
      nombreNegocio: string;
    }[] = JSON.parse(localStorage.getItem('codigos_seguimiento') || '[]');

    codigosGuardados.push({
      codigo,
      fechaCreacion: new Date().toISOString(),
      nombreNegocio: businessName,
    });

    localStorage.setItem(
      'codigos_seguimiento',
      JSON.stringify(codigosGuardados)
    );

    // Guardar el último generado por separado

    localStorage.setItem(
      'ultimo_codigo',
      JSON.stringify({
        codigo,
        fechaCreacion: new Date().toISOString(),
        nombreNegocio: businessName,
      })
    );

    // 6. Enviar mensaje por WhatsApp con los datos de la orden
    const mensaje = `_¡Hola! Te paso el resumen de mi pedido:_ \n
*Pedido ID:* ${order.id.toUpperCase().slice(0, 8)}\n
*Nombre:* ${cliente.nombre}\n
*Teléfono:* ${cliente.telefono}\n
*Dirección:* ${cliente.direccion}\n
*Total:* $${total}\n
*Metodo de pago*: ${cliente.metodoPago}\n
*Forma de entrega:* ${cliente.formaEntrega}\n
*Ubicación:* ${cliente.ubicacionLink || 'Sin ubicación'}\n
*Código de seguimiento:* ${codigo}\n
_Espero la confirmación del pedido._`;

    // 7. Obtener número del admin
    const { data: businessInfo, error: businnesError } = await this.supabase
      .from('business')
      .select('telefono')
      .eq('id', cliente.businessId)
      .limit(1)
      .single();

    if (businnesError || !businessInfo) {
      alert('Error al obtener número del admin');
      return;
    }

    const numeroDestino = businessInfo.telefono;
    const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(urlWhatsApp, '_blank');

    // 8. Limpiar carrito y redirigir (SI NO HAY BRAND REDIRIGE AL HOME)
    // await this.clearCart(cliente.businessId, '/dashboard-user');
  }
}

//Checkout con carga de comprobante (checkout-form-component)
//   async checkoutGuest(cliente: {
//     nombre: string;
//     telefono: string;
//     direccion: string;
//     businessId: string;
//     comprobanteUrl: string;
//     ubicacionLink?: string;
//   }) {
//     const cartItems = this.cartItems$.value;
//     if (cartItems.length === 0) return;

//     // Verificar stock
//     for (const item of cartItems) {
//       const { data: product, error } = await this.supabase
//         .from('products')
//         .select('*')
//         .eq('id', item.product_id)
//         .single();

//       if (error || !product || product.stock < item.quantity) {
//         alert(`No hay suficiente stock para el producto ${product?.name}`);
//         return;
//       }
//     }

//     // Generar código
//     const codigo =
//       'P-' + Math.random().toString(36).substring(2, 8).toUpperCase();
//     // Calcular total
//     const total = cartItems.reduce((sum, i) => sum + (i.total_price ?? 0), 0);

//     // 1. Insertar el pedido SIN select
//     const { error: orderError } = await this.supabase.from('orders').insert({
//       codigo_seguimiento: codigo,
//       total,
//       nombre: cliente.nombre,
//       telefono: cliente.telefono,
//       direccion: cliente.direccion,
//       ubicacion_link: cliente.ubicacionLink,
//       comprobante_pago: cliente.comprobanteUrl,
//       business_id: cliente.businessId,
//     });

//     if (orderError) {
//       console.error(orderError, cliente.businessId);
//       alert('Error al crear el pedido');
//       return;
//     }

//     // 2. Buscar el pedido recién insertado por código (que es único)
//     const { data: order, error: fetchError } = await this.supabase
//       .from('orders')
//       .select('id') // solo necesitás el ID
//       .eq('codigo_seguimiento', codigo)
//       .order('created_at', { ascending: false })
//       .limit(1)
//       .single(); // <- usás single porque esperás 1 resultado

//     if (fetchError || !order) {
//       alert('No se pudo recuperar el pedido recién creado');
//       return;
//     }

//     // 4. Agregar ítems y actualizar stock
//     for (const item of cartItems) {
//       const { error: itemError } = await this.supabase
//         .from('order_items')
//         .insert({
//           order_id: order.id,
//           product_id: item.product_id,
//           quantity: item.quantity,
//           price: item.total_price,
//           variant_ids: item.selectedVariants?.map((v) => v.id) || [],
//           option_ids: item.selectedOptions?.map((o) => o.id) || [],
//           selected_variants: item.selectedVariants || [],
//           selected_options: item.selectedOptions || [],
//           observation: item.observation,
//           business_id: cliente.businessId,
//         });

//       if (itemError) {
//         alert('Error al registrar ítems del pedido');
//         return;
//       }

//       //Función para decrementar stock (todavía no creada en supabase)
//       // await this.supabase.rpc('decrement_product_stock', {
//       //   product_id_input: item.product_id,
//       //   quantity_input: item.quantity,
//       // });
//     }

//     // 5. Guardar los códigos de seguimiento de localStorage en un array
//     // y agregar el nuevo código generado
//     const codigosGuardados: { codigo: string; fechaCreacion: string }[] =
//       JSON.parse(localStorage.getItem('codigos_seguimiento') || '[]');

//     codigosGuardados.push({
//       codigo,
//       fechaCreacion: new Date().toISOString(),
//     });

//     localStorage.setItem(
//       'codigos_seguimiento',
//       JSON.stringify(codigosGuardados)
//     );

//     // Guardar el último generado por separado

//     localStorage.setItem(
//       'ultimo_codigo',
//       JSON.stringify({
//         codigo,
//         fechaCreacion: new Date().toISOString(),
//       })
//     );

//     // 6. Enviar mensaje por WhatsApp con los datos de la orden
//     const mensaje = `_¡Hola! Te paso el resumen de mi pedido:_ \n
// *Pedido ID:* ${order.id.toUpperCase().slice(0, 8)}\n
// *Nombre:* ${cliente.nombre}\n
// *Teléfono:* ${cliente.telefono}\n
// *Dirección:* ${cliente.direccion}\n
// *Ubicación:* ${cliente.ubicacionLink || 'Sin ubicación'}\n
// *Total:* $${total}\n
// *Comprobante:* Subido \n
// *Código de seguimiento:* ${codigo}\n
// _Espero la confirmación del pedido._`;

//     // 7. Obtener número del admin
//     const { data: businessInfo, error: businnesError } = await this.supabase
//       .from('business')
//       .select('telefono')
//       .eq('id', cliente.businessId)
//       .limit(1)
//       .single();

//     if (businnesError || !businessInfo) {
//       alert('Error al obtener número del admin');
//       return;
//     }

//     const numeroDestino = businessInfo.telefono;
//     const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(
//       mensaje
//     )}`;
//     window.open(urlWhatsApp, '_blank');

//     // 8. Limpiar carrito y redirigir
//     await this.clearCart(cliente.businessId, '/dashboard-user');
//   }

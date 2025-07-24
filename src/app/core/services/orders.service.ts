import { Injectable } from '@angular/core';
import {
  createClient,
  RealtimeChannel,
  SupabaseClient,
} from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { SnackBarService } from './snackbar.service';
import { BehaviorSubject } from 'rxjs';
import { NgPlural } from '@angular/common';

interface Order {
  id: string;
  business_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private supabase: SupabaseClient;
  private newOrderSubject = new BehaviorSubject<any | null>(null);
  public newOrder$ = this.newOrderSubject.asObservable();
  private realtimeChannel: RealtimeChannel | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private snackBarService: SnackBarService
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  // Suscribirse a cambios en pedidos del usuario
  suscribirseACambiosDePedidos(
    userId: string,
    callback: (pedidoActualizado: any) => void
  ): void {
    if (this.realtimeChannel) return; // Evita múltiples suscripciones

    this.realtimeChannel = this.supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedOrder = payload.new;
          callback(updatedOrder);
        }
      )
      .subscribe();
  }

  // Cancelar suscripción
  cancelarSuscripcion(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
  }

  async getOrders(businessId: string | null = null) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(
        `
        *,
        users (
          nombre,
          telefono,
          email,
          direccion
        )
      `
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  updateOrderStatus(orderId: string, estado: string) {
    return this.supabase.from('orders').update({ estado }).eq('id', orderId);
  }

  getOrder(orderId: string) {
    return this.supabase.from('orders').select('*').eq('id', orderId).single();
  }

  async getOrderById(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(
        `
        *,
        user:users (id, email, phone, address)
      `
      )
      .eq('id', orderId)
      .single();

    return { data, error };
  }

  getOrderItems(orderId: string) {
    return this.supabase
      .from('order_items')
      .select('*, product:products(name, price, image_url)')
      .eq('order_id', orderId);
  }

  getUserIdByOrderId(orderId: string) {
    return this.supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();
  }

  getUserDataById(userId: string) {
    return this.supabase.from('users').select('*').eq('id', userId).single();
  }

  getOrdersByCode(codigo: string) {
    return this.supabase
      .from('orders')
      .select('*')
      .eq('codigo_seguimiento', codigo)
      .single();
  }

  async getComprobanteUrl(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('comprobante_pago')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      console.error('Error fetching comprobante URL:', error);
      return null;
    }
    return data.comprobante_pago; // aquí ya está el link completo
  }

  deleteOrder(orderId: string) {
    return this.supabase.from('orders').delete().eq('id', orderId);
  }

  startOrderListener(businessId: string | null) {
    this.authService.isUserAdmin().then((isAdmin) => {
      if (isAdmin) {
        this.listenToNewOrders(businessId);
      } else {
        return;
      }
    });
  }

  listenToNewOrders(businessId: string | null) {
    const supabase = this.supabaseService.getClient();

    console.log('[👂 Escuchando nuevas órdenes para businessId]', businessId);

    this.realtimeChannel = supabase
      .channel('orders-insert-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as Order;

          if (!newOrder) {
            console.error('❌ payload.new está vacío');
            return;
          }

          if (newOrder.business_id === businessId) {
            console.log('[✅ Orden válida para este negocio]', newOrder);
            this.newOrderSubject.next(newOrder);
            this.playNotificationSound();
          } else {
            console.warn(
              '[⚠️ Orden ignorada: otro negocio]',
              newOrder.business_id
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('[📡 Estado suscripción realtime]', status);
      });
  }

  playNotificationSound() {
    const audio = new Audio('assets/notification.mp3');
    audio
      .play()
      .catch((err) => console.error('Error al reproducir el sonido:', err));
  }

  async limpiarComprobantesAntiguos() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('id, comprobante_pago, created_at')
      .not('comprobante_pago', 'is', null);

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    console.log('Fetched orders with comprobante_pago:', data);

    const hoy = new Date();
    const ordenesViejas = data.filter((order: any) => {
      const fecha = new Date(order.created_at);
      const diffDays =
        (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24);
      console.log(
        `Order ID: ${order.id}, Fecha: ${fecha}, Días de antigüedad: ${diffDays}`
      );
      return diffDays > 30;
    });

    console.log('Ordenes viejas a limpiar:', ordenesViejas);

    for (const order of ordenesViejas) {
      const url = order.comprobante_pago;
      const nombreArchivo = this.extraerNombreDeURL(url); // ver abajo
      console.log(
        `Eliminando archivo: ${nombreArchivo} para orden: ${order.id}`
      );

      const { error: deleteError } = await this.supabase.storage
        .from('comprobantes') // nombre de tu bucket
        .remove([nombreArchivo]);

      if (deleteError) {
        console.error(
          `Error eliminando archivo ${nombreArchivo}:`,
          deleteError
        );
      } else {
        console.log(`Archivo ${nombreArchivo} eliminado correctamente.`);
        const { error: updateError } = await this.supabase
          .from('orders')
          .update({ comprobante_pago: null })
          .eq('id', order.id);
        if (updateError) {
          console.error(`Error actualizando orden ${order.id}:`, updateError);
        } else {
          console.log(`Orden ${order.id} actualizada correctamente.`);
        }
      }
    }
  }

  extraerNombreDeURL(url: string): string {
    const partes = url.split('/');
    return decodeURIComponent(partes[partes.length - 1].split('?')[0]);
  }
}

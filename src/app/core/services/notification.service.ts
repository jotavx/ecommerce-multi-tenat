// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private supabase: SupabaseClient;
  private pendingOrdersSubject = new BehaviorSubject<any[]>([]);
  public pendingOrders$ = this.pendingOrdersSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.supabase = this.supabaseService.getClient();
    this.listenToPendingOrders();
  }

  private async listenToPendingOrders() {
    this.authService.getBrand().then(async (result) => {
      const brand = result;
      const { data: businessData, error: businessError } = await this.supabase
        .from('business')
        .select('id')
        .eq('brand', brand)
        .single();

      if (businessError || !businessData) {
        console.error(
          '❌ No se pudo obtener el business_id:',
          businessError?.message
        );
        return;
      }

      const business_id = businessData.id;
      // Cargar inicialmente
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('business_id', business_id)
        .eq('estado', 'pendiente');

      if (!error) {
        this.pendingOrdersSubject.next(data);
      }

      // Escuchar en tiempo real
      this.supabase
        .channel('orders-pendientes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            this.updatePendingOrders(business_id);
          }
        )
        .subscribe();
    });
  }

  private async updatePendingOrders(businessId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .eq('estado', 'pendiente');

    if (!error) {
      this.pendingOrdersSubject.next(data);
    }
  }
}

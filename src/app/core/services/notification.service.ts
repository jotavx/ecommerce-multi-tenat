// // src/app/services/orders.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { SupabaseService } from './supabase.service';
// import { SupabaseClient } from '@supabase/supabase-js';
// import { AuthService } from './auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class NotificationService {
//   private supabase: SupabaseClient;
//   private pendingOrdersSubject = new BehaviorSubject<number>(0);
//   public pendingOrdersCount$ = this.pendingOrdersSubject.asObservable();

//   constructor(
//     private supabaseService: SupabaseService,
//     private authService: AuthService
//   ) {
//     this.supabase = this.supabaseService.getClient();
//     this.listenToPendingOrders();
//   }

//   //REALTIME
//   private async listenToPendingOrders() {
//     this.authService.getBrand().then(async (result) => {
//       const brand = result;
//       const { data: businessData, error: businessError } = await this.supabase //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER (getBrand())
//         .from('business')
//         .select('id')
//         .eq('brand', brand)
//         .single();

//       if (businessError || !businessData) {
//         console.error(
//           '❌ No se pudo obtener el business_id:',
//           businessError?.message
//         );
//         return;
//       }

//       const business_id = businessData.id;

//       // Cargar inicialmente
//       const { data, error } = await this.supabase
//         .from('orders')
//         .select('*')
//         .eq('business_id', business_id)
//         .eq('estado', 'pendiente');

//       if (!error && data) {
//         this.pendingOrdersSubject.next(data.length); // ← emitimos la cantidad
//       }

//       // Escuchar en tiempo real
//       this.supabase
//         .channel('orders-pendientes')
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'orders' },
//           (payload) => {
//             this.updatePendingOrders(business_id);
//           }
//         )
//         .subscribe();
//     });
//   }

//   private async updatePendingOrders(business_id: string) {
//     const { data, error } = await this.supabase
//       .from('orders')
//       .select('*')
//       .eq('business_id', business_id)
//       .eq('estado', 'pendiente');

//     if (!error && data) {
//       this.pendingOrdersSubject.next(data.length); // ← actualizar cantidad
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private supabase: SupabaseClient;
  private pendingOrdersSubject = new BehaviorSubject<number>(0);
  public pendingOrdersCount$ = this.pendingOrdersSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private businessService: BusinessService // ✅ nuevo
  ) {
    this.supabase = this.supabaseService.getClient();
    this.listenToPendingOrders();
  }

  // REALTIME
  private async listenToPendingOrders() {
    const brand = await this.authService.getBrand();
    if (!brand) {
      console.error('❌ No se pudo obtener el brand');
      return;
    }

    // ✅ Ahora obtenemos el businessId desde el BusinessService (con caché)
    const business_id = await this.businessService.getBusinessId(brand);
    if (!business_id) {
      console.error('❌ No se pudo obtener el business_id');
      return;
    }

    // Cargar inicialmente (solo count, más eficiente)
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business_id)
      .eq('estado', 'pendiente');

    if (!error && count !== null) {
      this.pendingOrdersSubject.next(count);
    }

    // Escuchar en tiempo real SOLO órdenes del negocio
    this.supabase
      .channel('orders-pendientes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${business_id}`, // ✅ filtramos en el canal
        },
        () => {
          this.updatePendingOrders(business_id);
        }
      )
      .subscribe();
  }

  private async updatePendingOrders(business_id: string) {
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }) // ✅ solo count
      .eq('business_id', business_id)
      .eq('estado', 'pendiente');

    if (!error && count !== null) {
      this.pendingOrdersSubject.next(count);
    }
  }
}

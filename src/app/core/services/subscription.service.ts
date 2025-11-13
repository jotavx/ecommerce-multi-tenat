import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getUserSubscription(userId: string): Promise<boolean> {
    console.log('Ejecutando getUserSubscription:', userId);
    const { data, error } = await this.supabase
      .from('users')
      .select('subscription_active')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener suscripción:', error);
      return false;
    }

    return !!data?.subscription_active;
  }

  async getUserSubscriptionExpire(userId: string): Promise<string | null> {
    console.log('Ejecutando getUserSubscriptionExpire:', userId);
    const { data, error } = await this.supabase
      .from('users')
      .select('subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener fecha de expiración:', error);
      return null;
    }

    return data?.subscription_expires_at ?? null;
  }

  async checkAndHandleExpiration(userId: string): Promise<void> {
    const expireDateStr = await this.getUserSubscriptionExpire(userId);
    if (!expireDateStr) return;

    const expireDate = new Date(expireDateStr);
    const today = new Date();
    const diffInMs = today.getTime() - expireDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays >= 0 && diffInDays < 1) {
      console.warn(
        'Tu suscripción vence hoy. ¡Renuevala para no perder acceso!'
      );
    }

    //Si la diferencia de días entre el día de expiración y hoy es mayor o igual a 1, desactivamos la suscripción y se guarda la fecha de vencimiento
    // if (diffInDays >= 1) {
    if (diffInDays >= 0) {
      const { error } = await this.supabase
        .from('users')
        .update({
          subscription_expires_at: null,
          subscription_active: false,
          expired_at: expireDate.toISOString(), // ⚠️ guardamos fecha del vencimiento
        })
        .eq('id', userId);

      if (error) {
        console.error('Error al actualizar estado de suscripción:', error);
      } else {
        console.log('Suscripción vencida y desactivada tras 1 día.');
      }
    }
  }

  async getUserExpiredAt(userId: string) {
    console.log('Ejecutando getUserExpiredAt:', userId);
    const { data, error } = await this.supabase
      .from('users')
      .select('expired_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener fecha de expiración:', error);
      return null;
    }

    return data?.expired_at ?? null;
  }
}

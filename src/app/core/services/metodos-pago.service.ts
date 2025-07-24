import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class MetodosPagoService {
  private supabase: SupabaseClient;
  metodos: { [key: string]: boolean } = {};

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getMetodosDePago(businessId: string | null) {
    const { data, error } = await this.supabase
      .from('metodos_pago')
      .select('*')
      .eq('business_id', businessId);

    if (!error && data) {
      this.metodos = {};
      data.forEach((m: any) => {
        this.metodos[m.name] = m.active;
      });
    } else {
      console.error('Error al obtener métodos de pago:', error?.message);
    }
  }

  async toggleMetodo(name: string, businessId: string | null) {
    const currentState = this.metodos[name] ?? false;
    const nuevoEstado = !currentState;

    const { data, error } = await this.supabase
      .from('metodos_pago')
      .select('*')
      .eq('name', name)
      .eq('business_id', businessId)
      .single();

    if (error || !data) {
      const { error: insertError } = await this.supabase
        .from('metodos_pago')
        .insert([{ name, business_id: businessId, active: true }]);

      if (insertError) {
        console.error('No se pudo insertar:', insertError.message);
        return;
      }

      this.metodos[name] = true;
      return;
    }

    const { error: updateError } = await this.supabase
      .from('metodos_pago')
      .update({ active: nuevoEstado })
      .eq('name', name)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('No se pudo actualizar:', updateError.message);
      return;
    }

    this.metodos[name] = nuevoEstado;
  }
}

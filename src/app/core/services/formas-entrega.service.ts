import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class formasEntregaService {
  private supabase: SupabaseClient;
  metodos: { name: string; label: string; active: boolean }[] = [];

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getFormasEntrega(businessId: string | null) {
    const { data: disponibles, error: errorDisponibles } = await this.supabase
      .from('formas_entrega_disponibles')
      .select('*');

    const { data: activos, error: errorActivos } = await this.supabase
      .from('formas_entrega')
      .select('*')
      .eq('business_id', businessId);

    if (errorDisponibles || errorActivos) {
      console.error(
        'Error al obtener formas de entrega:',
        errorDisponibles || errorActivos
      );
      return;
    }

    this.metodos = disponibles.map((m) => {
      const activo = activos.find((a) => a.name === m.name);
      return {
        name: m.name,
        label: m.label,
        active: activo ? activo.active : false,
      };
    });
  }

  getFormasEntregaActivas(): { name: string; label: string }[] {
    return this.metodos
      .filter((m) => m.active)
      .map((m) => ({ name: m.name, label: m.label }));
  }

  async toggleMetodo(name: string, businessId: string | null) {
    const metodo = this.metodos.find((m) => m.name === name);
    if (!metodo) return;

    const nuevoEstado = !metodo.active;

    const { data, error } = await this.supabase
      .from('formas_entrega')
      .select('*')
      .eq('name', name)
      .eq('business_id', businessId)
      .single();

    if (error || !data) {
      const { error: insertError } = await this.supabase
        .from('formas_entrega')
        .insert([{ name, business_id: businessId, active: true }]);

      if (insertError) {
        console.error(
          'Error al insertar forma de entrega:',
          insertError.message
        );
        return;
      }

      metodo.active = true;
      return;
    }

    const { error: updateError } = await this.supabase
      .from('formas_entrega')
      .update({ active: nuevoEstado })
      .eq('name', name)
      .eq('business_id', businessId);

    if (updateError) {
      console.error(
        'Error al actualizar forma de entrega:',
        updateError.message
      );
      return;
    }

    metodo.active = nuevoEstado;
  }
}

import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { HorarioDisponibilidad } from '../models/horario-disponibilidad.model';

// Enum para claridad en los días
export enum DiaSemana {
  Domingo = 0,
  Lunes,
  Martes,
  Miércoles,
  Jueves,
  Viernes,
  Sábado,
}

export interface Horario {
  dia: DiaSemana;
  horaInicio: string; // "HH:MM:SS"
  horaFin: string; // "HH:MM:SS"
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private supabase: SupabaseClient;
  private horarios: ReadonlyArray<Horario> = [];
  public cerradoTemporalmente = false;

  private debug = false;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  public configLoaded = false; // Nueva propiedad

  async cargarConfiguracionConRealtime(businessId: string | null) {
    try {
      const { data, error } = await this.supabase
        .from('estado_negocio')
        .select('cerrado_temporalmente')
        .eq('business_id', businessId)
        .single();

      if (error) throw error;
      this.cerradoTemporalmente = data?.cerrado_temporalmente ?? false;

      // Configurar realtime
      this.setupRealtimeUpdates(businessId);

      this.configLoaded = true; // Marcar como cargado
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.configLoaded = true; // Asegurarse de que la UI se renderice incluso con error
    }
  }

  private setupRealtimeUpdates(businessId: string | null) {
    this.supabase
      .channel('config-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estado_negocio',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          const newValue = (payload.new as { cerrado_temporalmente?: boolean })
            ?.cerrado_temporalmente;
          if (typeof newValue === 'boolean') {
            this.cerradoTemporalmente = newValue;
          }
        }
      )
      .subscribe();
  }

  async toggleCierreTemporal(businessId: string | null) {
    // Verificar si ya hay un registro en estado_negocio
    const { data: estadoData, error: estadoError } = await this.supabase
      .from('estado_negocio')
      .select('cerrado_temporalmente')
      .eq('business_id', businessId)
      .single();

    // Si no existe, lo creamos con cerrado_temporalmente = true
    if (estadoError || !estadoData) {
      const { error: insertError } = await this.supabase
        .from('estado_negocio')
        .insert([{ business_id: businessId, cerrado_temporalmente: true }]);

      if (insertError) {
        console.error(
          '❌ No se pudo insertar el estado:',
          insertError.message,
          businessId
        );
        return;
      }

      console.log('✔️ Estado creado en true');
      this.cerradoTemporalmente = true;
      return;
    }

    // Si existe, lo togglamos
    const nuevoEstado = !estadoData.cerrado_temporalmente;
    const { error: updateError } = await this.supabase
      .from('estado_negocio')
      .update({ cerrado_temporalmente: nuevoEstado })
      .eq('business_id', businessId);

    if (updateError) {
      console.error('❌ No se pudo actualizar el estado:', updateError.message);
      return;
    }

    console.log('✔️ Estado actualizado');
    this.cerradoTemporalmente = nuevoEstado;
  }

  async cargarHorariosDisponibilidad(businessId: string | null): Promise<void> {
    const { data, error } = await this.supabase
      .from('horarios_disponibilidad')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw error;

    this.horarios = data as Horario[];
    // console.log(this.horarios);
  }

  isOpen(): boolean {
    const ahora = new Date();
    const segundosAhora = this.getSegundosDesdeMedianoche(
      `${ahora.getHours()}:${ahora.getMinutes()}:${ahora.getSeconds()}`
    );
    const dia = ahora.getDay();

    this.log(
      `Verificando horario actual: ${ahora.toTimeString()} | Día: ${dia}`
    );

    const franjasDelDia = this.horarios.filter((h) => h.dia === dia);
    if (franjasDelDia.length === 0) {
      this.log('Tienda CERRADA (no hay horarios para este día)');
      return false;
    }

    for (const franja of franjasDelDia) {
      if (!this.esFranjaValida(franja)) {
        this.log(`Franja inválida ignorada: ${JSON.stringify(franja)}`);
        continue;
      }

      if (this.estaEnFranjaHoraria(segundosAhora, franja)) {
        this.log('Tienda ABIERTA (dentro de franja horaria)');
        return true;
      }
    }

    this.log('Tienda CERRADA (fuera de franjas horarias)');
    return false;
  }

  private getSegundosDesdeMedianoche(hora: string): number {
    const [h = 0, m = 0, s = 0] = hora.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  private estaEnFranjaHoraria(segundosAhora: number, franja: Horario): boolean {
    const inicio = this.getSegundosDesdeMedianoche(franja.horaInicio);
    const fin = this.getSegundosDesdeMedianoche(franja.horaFin);

    // Franja normal o cruzando la medianoche
    return fin > inicio
      ? segundosAhora >= inicio && segundosAhora < fin
      : segundosAhora >= inicio || segundosAhora < fin;
  }

  private esFranjaValida(franja: Horario): boolean {
    return (
      this.esHoraValida(franja.horaInicio) && this.esHoraValida(franja.horaFin)
    );
  }

  private esHoraValida(hora: string): boolean {
    // Validar formato HH:mm:ss y valores reales
    const [h, m, s] = hora.split(':').map(Number);
    return (
      !isNaN(h) &&
      !isNaN(m) &&
      !isNaN(s) &&
      h >= 0 &&
      h < 24 &&
      m >= 0 &&
      m < 60 &&
      s >= 0 &&
      s < 60
    );
  }

  private log(message: string) {
    if (this.debug) {
      console.log(`[ConfigService] ${message}`);
    }
  }

  //CRUD

  async getHorarios(
    businessId: string | null
  ): Promise<HorarioDisponibilidad[]> {
    const { data, error } = await this.supabase
      .from('horarios_disponibilidad')
      .select('*')
      .eq('business_id', businessId)
      .order('dia')
      .order('horaInicio');

    if (error) throw error;
    return data;
  }

  async addHorario(
    business_id: string | null,
    horario: HorarioDisponibilidad
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('horarios_disponibilidad')
      .insert({ ...horario, business_id });

    if (error) throw error;
    return data ?? [];
  }

  async deleteHorario(id: number) {
    const { error } = await this.supabase
      .from('horarios_disponibilidad')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

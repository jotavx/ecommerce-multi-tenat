import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private supabase: SupabaseClient;
  private businessId: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getBusinessId(brand: string): Promise<string | null> {
    if (this.businessId) return this.businessId;

    const { data, error } = await this.supabase
      .from('business')
      .select('id')
      .eq('brand', brand)
      .single();

    if (error) {
      console.error('Error al obtener el business ID:', error);
      return null;
    }

    this.businessId = data?.id || null;
    return this.businessId;
  }

  clearCache() {
    this.businessId = null;
  }

  async getAllBusinesses(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('business')
      .select(
        'brand, id, nombre_negocio, descripcion, telefono, email, logo_url'
      );
    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
    return data || [];
  }
}

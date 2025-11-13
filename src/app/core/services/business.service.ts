import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private supabase: SupabaseClient;
  private businessId: string | null = null;
  private businessesCache: any[] | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getBusinessId(brand: string | null): Promise<string | null> {
    if (this.businessId) {
      console.log('Returning businessId from cache:', this.businessId);
      return this.businessId;
    }

    const { data, error } = await this.supabase
      .from('business')
      .select('id')
      .eq('brand', brand)
      .single();
    console.log('Fetched businessId from Supabase:', data);
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
    if (this.businessesCache) {
      // 🔥 Retorna desde cache
      console.log('Returning businesses from cache');
      return this.businessesCache;
    }

    const { data, error } = await this.supabase
      .from('business')
      .select(
        'brand, id, nombre_negocio, descripcion, telefono, email, logo_url'
      );
    console.log('Fetched businesses from Supabase:', data);
    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }

    this.businessesCache = data || [];
    return this.businessesCache;
  }
}

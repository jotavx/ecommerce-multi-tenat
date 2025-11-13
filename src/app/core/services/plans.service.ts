import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async getPlans() {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error obteniendo los planes de subscripción:', error);
      return null;
    }

    return data;
  }
}

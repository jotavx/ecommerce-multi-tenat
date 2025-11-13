// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { from, Observable, of, tap } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public supabase: SupabaseClient;
  private userProfileCache: any | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  // getUserProfile(userId: string): Observable<any> {
  //   const query = this.supabase
  //     .from('users')
  //     .select('*')
  //     .eq('id', userId)
  //     .single();

  //   return from(query);
  // }

  getUserProfile(userId: string): Observable<any> {
    if (this.userProfileCache) {
      // Retornar cache como observable
      return of({ data: this.userProfileCache });
    }

    const query = this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return from(query).pipe(
      tap((response: any) => {
        if (response?.data) {
          this.userProfileCache = response.data;
        }
      })
    );
  }

  clearCache(): void {
    this.userProfileCache = null;
  }

  getBusinessProfile(userId: string): Observable<any> {
    const query = this.supabase
      .from('business')
      .select('*')
      .eq('user_id', userId)
      .single();

    return from(query);
  }

  async updateUserProfile(userId: string, data: any) {
    const { error } = await this.supabase
      .from('users')
      .update(data)
      .eq('id', userId);

    if (error) {
      throw error;
    }
  }

  async updateBusinessProfile(userId: string, data: any) {
    const { error } = await this.supabase
      .from('business')
      .update(data)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }
}

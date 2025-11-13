// account.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Elimina la cuenta del usuario autenticado
   * @returns Promise con resultado de la operación
   */
  async deleteAccount(): Promise<{ success: boolean; error?: any }> {
    try {
      // Llamar a la función RPC de Supabase
      const { data, error } = await this.supabase.rpc('delete_user_account');

      if (error) {
        console.error('Error eliminando cuenta:', error);
        return { success: false, error };
      }

      // Cerrar sesión después de eliminar
      await this.supabase.auth.signOut();

      // Redirigir a la página de inicio
      this.router.navigate(['/']);

      return { success: true };
    } catch (error) {
      console.error('Error inesperado:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

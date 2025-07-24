import { Injectable } from '@angular/core';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<any>(null);

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.supabase = this.supabaseService.getClient();

    this.supabase.auth.onAuthStateChange((_, session) => {
      this.userSubject.next(session?.user || null);
    });
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  async login(email: string, password: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return user;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.resetAdminStatus();
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.supabase.auth.getSession();
    return error || !data.session ? null : data.session;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    return !!data.session;
  }

  async signInWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) console.error('Error en login con Google:', error.message);
  }

  private isAdmin: boolean | null = null;

  async isUserAdmin(): Promise<boolean> {
    // Si ya tenemos el valor, lo retornamos
    if (this.isAdmin !== null) {
      return this.isAdmin;
    }

    try {
      const {
        data: { user },
        error: sessionError,
      } = await this.supabase.auth.getUser();
      if (!user || sessionError) {
        this.isAdmin = false;
        return false;
      }

      const { data, error } = await this.supabase
        .from('admin')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      this.isAdmin = !error && !!data;
      return this.isAdmin;
    } catch (err) {
      console.error('Error checking admin status:', err);
      this.isAdmin = false;
      return false;
    }
  }

  private brandSubject = new BehaviorSubject<string | null>(null);
  brand$ = this.brandSubject.asObservable();

  async loadBrand(): Promise<void> {
    const brand = await this.getBrand();
    this.brandSubject.next(brand);
    console.log('Brand desde authService:', brand);
  }

  async getBrand(): Promise<string | null> {
    try {
      const {
        data: { user },
        error: sessionError,
      } = await this.supabase.auth.getUser();

      if (sessionError || !user) {
        // console.error('Error al obtener el usuario de sesión:', sessionError);
        return null;
      }

      this.isAdmin = true;

      const { data, error } = await this.supabase
        .from('business')
        .select('brand')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error(
          'Error al obtener el brand desde la base de datos:',
          error
        );
        return null;
      }

      return data?.brand || null;
    } catch (error) {
      console.error('Error inesperado en getBrand:', error);
      return null;
    }
  }

  async getAdminAlias(brand: string | null): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('business')
        .select('alias_negocio')
        .eq('brand', brand)
        .maybeSingle();

      if (error) {
        console.error('Error obteniendo alias:', error.message);
        return null;
      }

      return data?.alias_negocio ?? null;
    } catch (err) {
      console.error('Error en getAdminAlias:', err);
      return null;
    }
  }

  // Método para resetear el estado cuando cambie el usuario
  resetAdminStatus(): void {
    this.isAdmin = null;
  }
}

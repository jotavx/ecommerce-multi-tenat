import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  public supabase: SupabaseClient;
  private readonly functionUrl = environment.functionUrl;

  constructor(
    private supabaseService: SupabaseService,
    private http: HttpClient
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Crea un enlace de pago usando Supabase Edge Function
   * @param tipo 'monthly' o 'annual'
   * @param email Email del usuario
   * @returns Observable con la URL de pago (init_point)
   */
  createPaymentLink(
    tipo: 'monthly' | 'annual',
    email: string,
    userId: string
  ): Observable<string> {
    const body = {
      type: tipo,
      email,
      user_id: userId,
    };

    // ⬇⬇⬇⬇⬇⬇⬇⬇⬇ GET SESSION
    return new Observable<string>((observer) => {
      this.supabase.auth.getSession().then(({ data, error }) => {
        if (error || !data.session?.access_token) {
          observer.error('No se pudo obtener el token de sesión');
          return;
        }

        const accessToken = data.session.access_token;

        this.http
          .post<{ init_point: string }>(this.functionUrl, body, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })
          .subscribe({
            next: (res) => observer.next(res.init_point),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
      });
    });
  }
}

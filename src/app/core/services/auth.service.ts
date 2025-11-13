// import { Injectable } from '@angular/core';
// import { Session, SupabaseClient } from '@supabase/supabase-js';
// import { SupabaseService } from './supabase.service';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   public supabase: SupabaseClient;
//   private userSubject = new BehaviorSubject<any>(null);

//   constructor(
//     private supabaseService: SupabaseService,
//     private router: Router //  { //   this.supabase = this.supabaseService.getClient(); //   this.supabase.auth.onAuthStateChange((_, session) => { //     this.userSubject.next(session?.user || null); //   }); // }
//   ) //Optimización: reducción de peticiones a la base de datos
//   {
//     this.supabase = this.supabaseService.getClient();

//     this.supabase.auth.getSession().then(({ data, error }) => {
//       if (data?.session?.user) {
//         this.userSubject.next(data.session.user);
//       } else {
//         this.userSubject.next(null);
//       }
//     });

//     this.supabase.auth.onAuthStateChange((_, session) => {
//       this.userSubject.next(session?.user || null);
//       this.resetAdminStatus(); // reset cuando cambia sesión
//     });
//   }

//   getUser(): Observable<any> {
//     return this.userSubject.asObservable();
//   }

//   async login(email: string, password: string) {
//     const {
//       data: { user },
//       error,
//     } = await this.supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return user;
//   }

//   async logout(): Promise<void> {
//     await this.supabase.auth.signOut();
//     this.resetAdminStatus();
//   }

//   // async getSession(): Promise<Session | null> {
//   //   const { data, error } = await this.supabase.auth.getSession(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET SESSION
//   //   return error || !data.session ? null : data.session;
//   // }

//   // async isAuthenticated(): Promise<boolean> {
//   //   const { data } = await this.supabase.auth.getSession(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET SESSION
//   //   return !!data.session;
//   // }

//   // En tu AuthService

//   // NUEVO - Obtiene el valor actual del usuario sin pedirlo a Supabase
//   getUserSync(): any {
//     return this.userSubject.value;
//   }

//   // Parche de getSession
//   async getSession(): Promise<Session | null> {
//     // Si ya hay usuario cargado en memoria, devolvemos la sesión actual
//     const user = this.userSubject.value;
//     if (!user) {
//       return null; // 🔒 Evita llamar a Supabase si no hay sesión
//     }

//     const { data, error } = await this.supabase.auth.getSession();
//     return error || !data.session ? null : data.session;
//   }

//   // Parche de getUser
//   async getUserSafe(): Promise<any | null> {
//     // Si ya hay usuario en memoria, lo devolvemos
//     const user = this.userSubject.value;
//     if (user) return user;

//     // Si no hay sesión, no pedimos a Supabase
//     const session = await this.getSession();
//     if (!session) return null;

//     const {
//       data: { user: supabaseUser },
//       error,
//     } = await this.supabase.auth.getUser();
//     if (error) {
//       console.error('Error obteniendo usuario:', error.message);
//       return null;
//     }
//     return supabaseUser;
//   }

//   async signInWithGoogle() {
//     const { error } = await this.supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${window.location.origin}/home`,
//       },
//     });
//     if (error) console.error('Error en login con Google:', error.message);
//   }

//   private isAdmin: boolean | null = null;

//   // Método para verificar si el usuario es administrador, acá se almacena el estado
//   // para evitar múltiples llamadas a la base de datos lo cual esta perfecto
//   async isUserAdmin(): Promise<boolean> {
//     // Si ya tenemos el valor, lo retornamos
//     if (this.isAdmin !== null) {
//       return this.isAdmin;
//     }

//     try {
//       const {
//         data: { user },
//         error: sessionError,
//       } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER
//       if (!user || sessionError) {
//         this.isAdmin = false;
//         return false;
//       }

//       const { data, error } = await this.supabase
//         .from('admin')
//         .select('user_id')
//         .eq('user_id', user.id)
//         .maybeSingle();

//       this.isAdmin = !error && !!data;
//       return this.isAdmin;
//     } catch (err) {
//       console.error('Error checking admin status:', err);
//       this.isAdmin = false;
//       return false;
//     }
//   }

//   private brandSubject = new BehaviorSubject<string | null>(null);

//   brand$ = this.brandSubject.asObservable();

//   // Método para cargar la marca
//   async loadBrand(): Promise<void> {
//     const brand = await this.getBrand();
//     this.brandSubject.next(brand);
//     console.log('Brand desde authService:', brand);
//   }

//   async getBrand(): Promise<string | null> {
//     try {
//       const {
//         data: { user },
//         error: sessionError,
//       } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

//       if (sessionError || !user) {
//         return null;
//       }

//       this.isAdmin = true;

//       const { data, error } = await this.supabase
//         .from('business')
//         .select('brand')
//         .eq('user_id', user.id)
//         .single();

//       if (error) {
//         console.error(
//           'Error al obtener el brand desde la base de datos:',
//           error
//         );
//         return null;
//       }

//       return data?.brand || null;
//     } catch (error) {
//       console.error('Error inesperado en getBrand:', error);
//       return null;
//     }
//   }

//   // Método para obtener el alias del administrador
//   async getAdminAlias(brand: string | null): Promise<string | null> {
//     try {
//       const { data, error } = await this.supabase
//         .from('business')
//         .select('alias_negocio')
//         .eq('brand', brand)
//         .maybeSingle();

//       if (error) {
//         console.error('Error obteniendo alias:', error.message);
//         return null;
//       }

//       return data?.alias_negocio ?? null;
//     } catch (err) {
//       console.error('Error en getAdminAlias:', err);
//       return null;
//     }
//   }

//   // Método para obtener el email del usuario autenticado
//   async getUserEmail(): Promise<string | null> {
//     const {
//       data: { user },
//       error,
//     } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

//     if (error) {
//       console.error('Error obteniendo usuario:', error.message);
//       return null;
//     }
//     console.log(user?.email);
//     return user?.email ?? null;
//   }

//   // Método para obtener el ID del usuario autenticado
//   // async getUserId(): Promise<string | null> {
//   //   const {
//   //     data: { user },
//   //     error,
//   //   } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

//   //   if (error) {
//   //     console.error('Error obteniendo usuario:', error.message);
//   //     return null;
//   //   }
//   //   // console.log(user?.id);
//   //   return user?.id ?? null;
//   // }

//   async getUserId(): Promise<string | null> {
//     const user = this.userSubject.value;
//     if (!user) return null;
//     return user.id;
//   }

//   // Método para resetear el estado cuando cambie el usuario
//   resetAdminStatus(): void {
//     this.isAdmin = null;
//   }
// }

//Servicio optimizado para evitar múltiples llamadas a la base de datos y mejorar el rendimiento, el código comentado es la versión anterior que hacía múltiples peticiones innecesarias, si hay error con el código anterior funcionaba correctamente pero con llamadas innecesarias a la base de datos.

import { Injectable } from '@angular/core';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<any>(null);

  private isAdmin: boolean | null = null;
  private brandSubject = new BehaviorSubject<string | null>(null);

  brand$ = this.brandSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private userService: UserService,
    private businessService: BusinessService
  ) {
    this.supabase = this.supabaseService.getClient();

    // Inicializar usuario desde sesión actual
    this.supabase.auth.getSession().then(({ data }) => {
      this.userSubject.next(data?.session?.user || null);
    });

    // Escuchar cambios de sesión
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.userSubject.next(session?.user || null);
      this.resetAdminStatus();
      this.brandSubject.next(null); // reset brand cuando cambia sesión

      // 🔥 limpiar caches cuando cambia de usuario
      this.userService.clearCache();
      this.businessService.clearCache();
    });
  }

  // ==========
  // AUTH
  // ==========
  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  getUserSync(): any {
    return this.userSubject.value;
  }

  public async ensureUser(): Promise<any | null> {
    if (this.userSubject.value) return this.userSubject.value;
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error || !user) return null;
    this.userSubject.next(user);
    return user;
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
    // Resetea el estado del admin
    this.resetAdminStatus();
    // Limpia el cache del perfil de usuario
    this.userService.clearCache();

    this.brandSubject.next(null);
  }

  async signInWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (error) console.error('Error en login con Google:', error.message);
  }

  async getSession(): Promise<Session | null> {
    const user = this.getUserSync();
    if (!user) return null;
    const { data, error } = await this.supabase.auth.getSession();
    return error || !data.session ? null : data.session;
  }

  // ==========
  // ADMIN
  // ==========
  async isUserAdmin(): Promise<boolean> {
    if (this.isAdmin !== null) return this.isAdmin;

    const user = await this.ensureUser();
    if (!user) return false;

    const { data, error } = await this.supabase
      .from('admin')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    this.isAdmin = !error && !!data;
    return this.isAdmin;
  }

  public resetAdminStatus(): void {
    this.isAdmin = null;
  }

  // ==========
  // BRAND
  // ==========
  async loadBrand(): Promise<void> {
    const brand = await this.getBrand();
    this.brandSubject.next(brand);
    console.log('Brand desde authService:', brand);
  }

  async getBrand(): Promise<string | null> {
    if (this.brandSubject.value) return this.brandSubject.value;

    const user = await this.ensureUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('business')
      .select('brand')
      .eq('user_id', user.id)
      .single();

    if (!error && data?.brand) {
      this.brandSubject.next(data.brand);
      return data.brand;
    }
    return null;
  }

  async getAdminAlias(brand: string | null): Promise<string | null> {
    if (!brand) return null;
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
  }

  // ==========
  // USER INFO
  // ==========
  async getUserEmail(): Promise<string | null> {
    const user = await this.ensureUser();
    return user?.email || null;
  }

  async getUserId(): Promise<string | null> {
    const user = this.getUserSync();
    return user?.id || null;
  }
}

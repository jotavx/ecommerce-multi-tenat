// import { inject } from '@angular/core';
// import { CanActivateFn, Router, UrlTree } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// export const profileGuard: CanActivateFn = async (): Promise<
//   boolean | UrlTree
// > => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 1️⃣ Obtener usuario autenticado
//   const {
//     data: { user },
//   } = await authService.supabase.auth.getUser();

//   if (!user) {
//     // No autenticado: redirigir a login
//     return router.createUrlTree(['/login']);
//   }

//   // 2️⃣ Verificar si existe el perfil en 'users'
//   const { data: existingUser, error } = await authService.supabase
//     .from('users')
//     .select('id')
//     .eq('id', user.id)
//     .single();

//   if (error && error.code !== 'PGRST116') {
//     console.error('Error al verificar perfil:', error.message);
//     // Podrías devolver false o redirigir a un error page
//     return router.createUrlTree(['/login']);
//   }

//   // 3️⃣ Permitir o redirigir según exista el perfil
//   return existingUser ? true : router.createUrlTree(['/complete-profile']);
// };

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const profileGuard: CanActivateFn = async (): Promise<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const {
    data: { user },
  } = await authService.supabase.auth.getUser();

  //  Si NO está autenticado, permití que acceda al /home
  if (!user) {
    return true;
  }

  // 🔎 Si está autenticado, comprobá si ya tiene perfil
  const { data: existingUser, error } = await authService.supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  // Si ya tiene perfil verificá si es admin
  if (existingUser) {
    const { data: adminProfile, error: adminError } = await authService.supabase
      .from('admin')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    //Si es administrador redirigí al brand del usuario
    if (adminProfile) {
      const { data, error: fetchError } = await authService.supabase
        .from('business')
        .select('brand')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching brand:', fetchError);
      }

      const brand = data?.brand;

      if (brand) {
        router.navigate([`tienda/${brand}`]);
      }
    }
  }

  // ❌ Si ocurre error grave (distinto a "no encontrado"), redirigí por seguridad
  if (error && error.code !== 'PGRST116') {
    console.error('Error al verificar perfil:', error.message);
    return router.createUrlTree(['/login']);
  }

  // ⚠️ Si NO existe perfil → redirigí a completar perfil
  if (!existingUser) {
    return router.createUrlTree(['/complete-profile']);
  }

  // ✅ Todo bien → puede entrar al home
  return true;
};

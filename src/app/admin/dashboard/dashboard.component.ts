//////////////////////////////// PREVIO

// import { Component } from '@angular/core';
// import { AuthService } from '../../core/services/auth.service';
// import { Subject, Subscription, takeUntil } from 'rxjs';
// import { UserService } from '../../core/services/user.service';
// import { SubscriptionService } from '../../core/services/subscription.service';
// import { NavigationEnd, Router } from '@angular/router';
// import { NotificationService } from '../../core/services/notification.service';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.css',
// })
// export class DashboardComponent {
//   activeTab = 'orders';
//   isUserAdmin: boolean = false;
//   private destroy$ = new Subject<void>();
//   user: any | null = null;
//   userId: any | null = null;
//   notUser: boolean = true;
//   brand: string | null = null;

//   pendingCount: number = 0;

//   private routerSub: Subscription | undefined;

//   constructor(
//     private authService: AuthService,
//     private userService: UserService,
//     public subscriptionService: SubscriptionService,
//     private notificationService: NotificationService,
//     private router: Router
//   ) {}

//   async ngOnInit(): Promise<void> {
//     await this.obtenerBrand();
//     this.checkAuthState();

//     // Ejecutar al cargar el componente
//     this.verificarSuscripcion();

//     // Ejecutar en cada navegación
//     this.routerSub = this.router.events.subscribe((event) => {
//       if (event instanceof NavigationEnd) {
//         this.verificarSuscripcion();
//       }
//     });

//     //NUEVO - MANEJO DE SUBSCRIPCIÓN
//     await this.authService
//       .getUserId()
//       .then((result) => {
//         this.userId = result;
//       })
//       .catch((error) => {
//         console.log('Error al obtener userID:', error);
//       });

//     if (this.userId) {
//       await this.subscriptionService.checkAndHandleExpiration(this.userId);
//     } else {
//       console.log('Error al obtener userID');
//     }

//     // Verificamos si hay pedidos pendientes

//     this.notificationService.pendingOrdersCount$.subscribe((count) => {
//       this.pendingCount = count;
//     });
//   }

//   ngOnDestroy() {
//     this.routerSub?.unsubscribe();
//   }

//   async obtenerBrand() {
//     this.brand = await this.authService.getBrand();
//   }

//   private checkAuthState(): void {
//     this.authService
//       .getUser()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (user) => {
//           if (!user) {
//             this.handleNoUser();
//             return;
//           }

//           this.notUser = false;
//           this.user = user;
//           this.userId = user.id;

//           // No vuelvas a llamar getUserId(), usá user.id directamente
//           this.subscriptionService.checkAndHandleExpiration(this.userId);
//           this.getUserProfile(this.userId);
//           this.checkAdminStatus();
//         },
//         error: () => this.handleNoUser(),
//       });
//   }

//   private getUserProfile(userId: string): void {
//     this.userService
//       .getUserProfile(userId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           this.user = response.data;
//         },
//         error: () => {
//           this.user = null;
//         },
//       });
//   }

//   private async checkAdminStatus(): Promise<void> {
//     try {
//       this.isUserAdmin = await this.authService.isUserAdmin();
//     } catch (error) {
//       console.error('Error al verificar admin:', error);
//       this.isUserAdmin = false;
//     }
//   }

//   private handleNoUser(): void {
//     this.user = null;
//     this.notUser = true;
//     this.isUserAdmin = false;
//   }

//   tabs = [
//     { id: 'orders', label: 'Pedidos' },
//     { id: 'categories', label: 'Categorías' },
//     { id: 'products', label: 'Productos' },
//     { id: 'variants-products-manager', label: 'Variantes/Opciones' },
//     { id: 'config', label: 'Configuración' },
//   ];

//   async verificarSuscripcion() {
//     const { data, error } = await this.authService.supabase.auth.getUser();
//     if (!data?.user) {
//       // this.router.navigate(['/login']);
//       return;
//     }

//     const { data: userData } = await this.authService.supabase
//       .from('users')
//       .select('expired_at')
//       .eq('id', data.user.id)
//       .single();

//     const expiredAtStr = userData?.expired_at;
//     if (!expiredAtStr) return;

//     const expiredAt = new Date(expiredAtStr);
//     const now = new Date();
//     const diffDays =
//       (now.getTime() - expiredAt.getTime()) / (1000 * 60 * 60 * 24);

//     if (diffDays >= 3) {
//       this.router.navigate([`/tienda/${this.brand}/subscription`]);
//     }
//   }
// }

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = 'orders';
  isUserAdmin: boolean = false;
  private destroy$ = new Subject<void>();

  user: any | null = null;
  userId: string = '';
  notUser: boolean = true;
  brand: string | null = null;

  pendingCount: number = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Cacheamos brand una sola vez
    this.brand = await this.authService.getBrand();

    // Observamos cambios de usuario
    this.authService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (user) => {
          if (!user) {
            this.handleNoUser();
            return;
          }

          this.notUser = false;
          this.user = user;
          this.userId = user.id;

          // Solo una vez: verificar expiración suscripción
          // await this.subscriptionService.checkAndHandleExpiration(this.userId);

          // Perfil de usuario
          this.getUserProfile(this.userId);

          // Estado admin
          this.checkAdminStatus();

          // Verificar suscripción (si corresponde)
          this.verificarSuscripcion();
        },
        error: () => this.handleNoUser(),
      });

    // Sub a notificaciones (con desuscripción segura)
    this.notificationService.pendingOrdersCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.pendingCount = count;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getUserProfile(userId: string): void {
    this.userService
      .getUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.user = response.data;
        },
        error: () => {
          this.user = null;
        },
      });
  }

  private async checkAdminStatus(): Promise<void> {
    try {
      this.isUserAdmin = await this.authService.isUserAdmin();
    } catch (error) {
      console.error('Error al verificar admin:', error);
      this.isUserAdmin = false;
    }
  }

  private handleNoUser(): void {
    this.user = null;
    this.notUser = true;
    this.isUserAdmin = false;
  }

  tabs = [
    { id: 'orders', label: 'Pedidos' },
    { id: 'categories', label: 'Categorías' },
    { id: 'products', label: 'Productos' },
    { id: 'variants-products-manager', label: 'Variantes/Opciones' },
    { id: 'config', label: 'Configuración' },
  ];

  private async verificarSuscripcion() {
    if (!this.userId || !this.brand) return;

    const { data: userData } = await this.authService.supabase
      .from('users')
      .select('expired_at')
      .eq('id', this.userId)
      .single();

    const expiredAtStr = userData?.expired_at;
    if (!expiredAtStr) return;

    const expiredAt = new Date(expiredAtStr);
    const now = new Date();
    const diffDays =
      (now.getTime() - expiredAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays >= 3) {
      this.router.navigate([`/tienda/${this.brand}/subscription`]);
    }
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { CartService } from '../../../core/services/cart.service';
import { environmentLogo } from '../../../../environments/logo';
import { BusinessService } from '../../../core/services/business.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: any | null = null;
  notUser: boolean = true;
  isUserAdmin: boolean = false;
  loading = true;
  logoUrl = environmentLogo.supabaseLogoUrl;
  notifications: any[] = [];
  brand: string | null = null;
  businessId: string | null = null;

  cartItemCount = 0;
  isSidebarOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private themeService: ThemeService,
    private businessService: BusinessService,
    private cartService: CartService,
    public router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.checkAuthState();
    this.initializeBrandAndBusiness();

    this.cartService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.cartItemCount = count;
      });

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isSidebarOpen = false;
      this.initializeBrandAndBusiness();
    });
  }

  private initializeBrandAndBusiness(): void {
    this.obtenerBrandDesdeURL();

    if (this.brand) {
      this.businessService
        .getBusinessId(this.brand)
        .then((result) => {
          this.businessId = result;
          this.cartService.refreshCartItemCount(this.businessId);
        })
        .catch((error) => {
          console.log('Error obteniendo businessId:', error);
        });
    }
  }

  obtenerBrandDesdeURL() {
    const url = this.router.url;
    const match = url.match(/\/tienda\/([^\/]+)/);
    if (match && match[1]) {
      this.brand = match[1];
      // console.log('Brand desde navbar:', this.brand);
    } else {
      this.brand = null;
      // console.log('Error obteniendo el brand desde el navbar');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.isSidebarOpen &&
      event.target &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.isSidebarOpen = false;
    }
  }

  private checkAuthState(): void {
    this.loading = true;

    this.authService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.notUser = false;
            this.getUserProfile(user.id);
            this.checkAdminStatus();
          } else {
            this.handleNoUser();
          }
        },
        error: () => this.handleNoUser(),
      });
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
    } finally {
      this.loading = false;
    }
  }

  private handleNoUser(): void {
    this.user = null;
    this.notUser = true;
    this.isUserAdmin = false;
    this.loading = false;
  }

  logout() {
    this.authService
      .logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error al desconectar al usuario:', error.message);
      });
  }

  async updateCartItemCount() {
    if (this.businessId) {
      this.cartItemCount = await this.cartService.getCartItemCount(
        this.businessId
      );
    }
  }
}

// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   ElementRef,
//   HostListener,
// } from '@angular/core';
// import { UserService } from '../../../core/services/user.service';
// import { AuthService } from '../../../core/services/auth.service';

// import { Subject, takeUntil } from 'rxjs';
// import { Router } from '@angular/router';
// import { ThemeService } from '../../../core/services/theme.service';
// import { CartService } from '../../../core/services/cart.service';
// import { environmentLogo } from '../../../../environments/logo';

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.css'], // Mejor usar styleUrls en lugar de styleUrl
// })
// export class NavbarComponent implements OnInit, OnDestroy {
//   user: any | null = null;
//   notUser: boolean = true;
//   isUserAdmin: boolean = false;
//   loading = true;
//   logoUrl = environmentLogo.supabaseLogoUrl;
//   notifications: any[] = [];
//   brand: string | null = null;

//   cartItemCount = 0;
//   isSidebarOpen = false;

//   private destroy$ = new Subject<void>();

//   constructor(
//     private userService: UserService,
//     private authService: AuthService,
//     public router: Router,
//     private themeService: ThemeService,
//     private eRef: ElementRef,
//     private cartService: CartService
//   ) {}

//   ngOnInit(): void {
//     this.checkAuthState();
//     this.obtenerBrandDesdeURL();

//     this.cartService.cartCount$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((count) => {
//         this.cartItemCount = count;
//       });

//     // Llama a refreshCartItemCount con el brand actual, si existe
//     if (this.brand) {
//       this.cartService.refreshCartItemCount(this.brand);
//     }

//     this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
//       this.isSidebarOpen = false;
//       this.obtenerBrandDesdeURL();

//       // Después de obtener el brand, refrescá el contador del carrito
//       if (this.brand) {
//         this.cartService.refreshCartItemCount(this.brand);
//       }
//     });
//   }

//   obtenerBrandDesdeURL() {
//     const url = this.router.url;
//     const match = url.match(/\/tienda\/([^\/]+)/);
//     if (match && match[1]) {
//       this.brand = match[1];
//     } else {
//       this.brand = null;
//     }
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   toggleTheme(): void {
//     this.themeService.toggleTheme();
//   }

//   toggleSidebar() {
//     this.isSidebarOpen = !this.isSidebarOpen;
//   }

//   @HostListener('document:click', ['$event'])
//   onClickOutside(event: MouseEvent) {
//     if (this.isSidebarOpen && !this.eRef.nativeElement.contains(event.target)) {
//       this.isSidebarOpen = false;
//     }
//   }

//   private checkAuthState(): void {
//     this.loading = true;

//     this.authService
//       .getUser()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (user) => {
//           if (user) {
//             this.notUser = false;
//             this.getUserProfile(user.id);
//             this.checkAdminStatus();
//           } else {
//             this.handleNoUser();
//           }
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
//     } finally {
//       this.loading = false;
//     }
//   }

//   private handleNoUser(): void {
//     this.user = null;
//     this.notUser = true;
//     this.isUserAdmin = false;
//     this.loading = false;
//   }

//   logout() {
//     this.authService
//       .logout()
//       .then(() => {
//         this.router.navigate(['/login']);
//       })
//       .catch((error) => {
//         console.error('Error al desconectar al usuario:', error.message);
//       });
//   }

//   async updateCartItemCount() {
//     this.cartItemCount = await this.cartService.getCartItemCount(
//       this.brand || ''
//     );
//   }
// }

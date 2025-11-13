import { Component, OnInit } from '@angular/core'; // Asegurate de importar OnInit
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { OrdersService } from './core/services/orders.service';
import { ThemeService } from './core/services/theme.service';
import { ConfigService } from './core/services/config.service';
import { AuthService } from './core/services/auth.service';
import { BusinessService } from './core/services/business.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Tienda virtual';
  order = '';

  isUserAdmin = false;
  configCargada = false;

  brand: string | null = null;
  businessId: string | null = null;

  show: boolean = true;

  private rutasPermitidas: string[] = [
    '/home',
    '/complete-profile',
    '/register',
    '/login',
    '/register-success',
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private themeService: ThemeService,
    public configService: ConfigService,
    private businessService: BusinessService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // localStorage.clear();
      this.themeService.initializeTheme();
      this.checkCurrentRoute();

      // Cargar siempre el brand y businessId (público o admin)
      this.brand = await this.obtenerBrand();
      if (!this.brand) throw new Error('No se pudo obtener el brand');

      this.businessId = await this.businessService.getBusinessId(this.brand);
      if (!this.businessId) throw new Error('No se pudo obtener el businessId');

      // Estado del negocio: SIEMPRE, esté logueado o no
      await this.obtenerEstadoNegocio(this.businessId);

      // Ahora recién vemos si hay sesión (flujo admin)
      const session = await this.authService.getSession();
      if (session) {
        await this.checkAdminStatus();
        await this.ordersService.startOrderListener(this.businessId);
      }
    } catch (error) {
      console.error('Error en ngOnInit:', error);
    }
  }

  // ngOnInit(): void {
  //   this.themeService.initializeTheme();
  //   this.checkCurrentRoute();

  //   this.authService.getUser().subscribe(async (user) => {
  //     if (user) {
  //       // 🔥 si ya tenés brand y businessId cargados, no vuelvas a pedirlos
  //       if (!this.brand) {
  //         this.brand = await this.obtenerBrand();
  //       }
  //       if (!this.businessId) {
  //         this.businessId = await this.businessService.getBusinessId(
  //           this.brand
  //         );
  //       }

  //       if (this.businessId) {
  //         await this.obtenerEstadoNegocio(this.businessId);
  //       }

  //       await this.checkAdminStatus();
  //       await this.ordersService.startOrderListener(this.businessId);
  //     } else {
  //       // Usuario deslogueado → limpiar estado
  //       this.isUserAdmin = false;
  //       this.brand = null;
  //       this.businessId = null;
  //     }
  //   });
  // }

  async obtenerBrand(): Promise<string> {
    // Primero intenta obtenerlo de la ruta raíz
    let brand = this.route.snapshot.firstChild?.paramMap.get('brand') || '';

    // Si no está en la ruta raíz, monitorea cambios de navegación
    if (!brand) {
      brand = await new Promise((resolve) => {
        this.router.events
          .pipe(filter((event) => event instanceof NavigationEnd))
          .subscribe(() => {
            const brandFromRoute =
              this.route.snapshot.firstChild?.paramMap.get('brand') || '';
            if (brandFromRoute) {
              resolve(brandFromRoute);
            }
          });
      });
    }

    console.warn('Brand en app-component:', brand);
    return brand;
  }

  private async checkAdminStatus(): Promise<void> {
    try {
      this.isUserAdmin = await this.authService.isUserAdmin();
    } catch (error) {
      console.error('Error al verificar admin:', error);
      this.isUserAdmin = false;
    }
  }

  checkCurrentRoute() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const rutaActual = event.urlAfterRedirects;

          this.show = !this.rutasPermitidas.includes(rutaActual);
        }
      });
  }

  async obtenerEstadoNegocio(businessId: string | null) {
    await this.configService.cargarConfiguracionConRealtime(businessId);
    await this.configService.cargarHorariosDisponibilidad(businessId);
    this.configCargada = true;
  }
}

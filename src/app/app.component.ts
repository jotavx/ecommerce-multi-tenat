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
  title = 'ecommerce-supabase';
  order = '';
  isUserAdmin = false;
  configCargada = false;
  brand: string = '';
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
      //NEW
      this.checkCurrentRoute();
      //
      await this.checkAdminStatus();

      this.brand = await this.obtenerBrand();

      if (!this.brand) {
        throw new Error('No se pudo obtener el brand');
      }

      this.businessId = await this.businessService.getBusinessId(this.brand);

      if (!this.businessId) {
        throw new Error('No se pudo obtener el businessId');
      }

      await Promise.all([
        this.ordersService.startOrderListener(this.businessId),
        this.obtenerEstadoNegocio(this.businessId),
      ]);

      this.themeService.initializeTheme();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
    }
  }

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

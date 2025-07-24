import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  activeTab = 'orders';
  isUserAdmin: boolean = false;
  private destroy$ = new Subject<void>();
  user: any | null = null;
  notUser: boolean = true;
  brand: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.obtenerBrand();
    this.checkAuthState();
  }

  async obtenerBrand() {
    this.brand = await this.authService.getBrand();
  }

  private checkAuthState(): void {
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
}

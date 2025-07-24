import { Component } from '@angular/core';
import { formasEntregaService } from '../../core/services/formas-entrega.service';
import { BusinessService } from '../../core/services/business.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-formas-entrega',
  templateUrl: './formas-entrega.component.html',
  styleUrl: './formas-entrega.component.css',
})
export class FormasEntregaComponent {
  loading = false;
  brand: string | null = null;
  businessId: string | null = null;

  constructor(
    private authService: AuthService,
    private businessService: BusinessService,
    public formasEntrega: formasEntregaService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.brand = await this.authService.getBrand();
      if (this.brand) {
        this.businessId = await this.businessService.getBusinessId(this.brand);
        this.formasEntrega.getFormasEntrega(this.businessId);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.loading = false;
    }
  }

  toggleMetodo(name: string) {
    this.formasEntrega.toggleMetodo(name, this.businessId);
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';
import { MetodosPagoService } from '../../core/services/metodos-pago.service';

@Component({
  selector: 'app-metodos-pago',
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.css',
})
export class MetodosPagoComponent {
  loading = false;
  brand: string | null = null;
  businessId: string | null = null;

  constructor(
    private authService: AuthService,
    private businessService: BusinessService,
    public metodosPago: MetodosPagoService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.brand = await this.authService.getBrand();
      if (this.brand) {
        this.businessId = await this.businessService.getBusinessId(this.brand);
        this.metodosPago.getMetodosDePago(this.businessId);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.loading = false;
    }
  }

  toggleMetodo(name: string) {
    this.metodosPago.toggleMetodo(name, this.businessId);
  }
}

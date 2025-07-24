import { Component } from '@angular/core';
import { OrdersService } from '../../core/services/orders.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.css',
})
export class TrackOrderComponent {
  loading: boolean = false;
  order: any = null; // Ahora es un objeto, no un array
  brand: string | null = null;
  trackCode: string = '';

  constructor(
    private ordersService: OrdersService,
    private route: ActivatedRoute
  ) {}

  // trackOrder(code: string) {
  //   this.loading = true;
  //   this.order = null;
  //   this.ordersService.getOrdersByCode(code).then(({ data, error }) => {
  //     if (error) {
  //       console.error('Error fetching order:', error);
  //     } else {
  //       this.order = data || null;
  //     }
  //     this.loading = false;
  //   });
  // }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.brand = params.get('brand') || '';
    });
  }

  trackOrder(code: string) {
    this.loading = true;
    this.order = null;

    // Limpiar espacios y convertir a mayúsculas
    const normalizedCode = code.trim().toUpperCase();

    this.ordersService
      .getOrdersByCode(normalizedCode)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching order:', error);
        } else {
          this.order = data || null;
        }
        this.loading = false;
      });
  }

  getEstadoLegible(estado: string): string {
    const estados: Record<string, string> = {
      en_preparacion: 'En preparación',
      listo: 'Listo para envío/entrega',
      en_camino: 'En camino',
      completado: 'Completado',
      cancelado: 'Cancelado',
      reembolsado: 'Reembolsado',
      pendiente: 'Pendiente',
    };
    return estados[estado] || estado;
  }
}

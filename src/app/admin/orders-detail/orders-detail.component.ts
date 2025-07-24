import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-orders-detail',
  templateUrl: './orders-detail.component.html',
  styleUrl: './orders-detail.component.css',
})
export class OrdersDetailComponent {
  orderId!: string;
  userId!: string;
  userName!: string;
  userDireccion!: string;
  userUbicacion!: string;
  userTelefono!: string;

  items: any[] = [];
  order: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    this.loadOrder();
  }

  async loadOrder() {
    this.loading = true;

    const { data: order, error: orderError } =
      await this.ordersService.getOrder(this.orderId);
    if (orderError) {
      console.error('Error loading order', orderError);
    } else {
      this.order = order;
    }

    const { data: items, error: itemsError } =
      await this.ordersService.getOrderItems(this.orderId);
    if (itemsError) {
      console.error('Error loading items', itemsError);
    } else {
      this.items = items || [];
    }

    this.loading = false;
  }

  async downloadComprobante() {
    const url = await this.ordersService.getComprobanteUrl(this.orderId);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No se encontró el comprobante.');
    }
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

  goBack() {
    history.back();
  }
}

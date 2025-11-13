import { Component, HostListener, OnInit } from '@angular/core';
import { OrdersService } from '../../core/services/orders.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CambiarEstadoDialogComponent } from '../../shared/components/dialogs/cambiar-estado-dialog/cambiar-estado-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';

@Component({
  selector: 'app-orders-manager',
  templateUrl: './orders-manager.component.html',
  styleUrls: ['./orders-manager.component.css'],
})
export class OrdersManagerComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  searchTerm: string = '';
  brand: string | null = null;
  businessId: string | null = null;

  constructor(
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private businessService: BusinessService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.brand = params.get('brand') || '';
      // console.warn('Brand en orders-manager:', this.brand);

      if (this.brand) {
        this.businessService
          .getBusinessId(this.brand)
          .then((result) => {
            this.businessId = result;
            this.getOrders(this.businessId);
            this.ordersService.listenToNewOrders(this.businessId);
          })
          .catch((error) => {
            console.log('Error en ngOnInit:', error);
          });
      }
    });
  }

  getOrders(businessId: string | null = null) {
    if (!businessId) {
      console.error('No se proporcionó businessId válido a getOrders');
      return;
    }

    this.loading = true;

    this.ordersService.getOrders(this.businessId).then((result) => {
      if (!result) {
        console.error('No se recibió respuesta de getOrders');
        this.loading = false;
        return;
      }

      const { data, error } = result;
      if (error) {
        console.error('Error al obtener órdenes:', error);
      } else {
        this.orders = data || [];
      }

      this.loading = false;
    });
  }

  filteredOrders() {
    if (!this.searchTerm) return this.orders;
    const term = this.searchTerm.toLowerCase().trim();

    return this.orders.filter((order) => {
      const nombre = order.users?.nombre || order.nombre || '';
      const telefono = order.users?.telefono || order.telefono || '';
      const email = order.users?.email || order.email || '';
      const direccion = order.users?.direccion || order.direccion || '';
      const id = order.id || '';
      const fecha = order.created_at
        ? new Date(order.created_at).toLocaleString().toLowerCase()
        : '';
      const total = order.total?.toString() || '';

      return (
        nombre.toLowerCase().includes(term) ||
        telefono.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        direccion.toLowerCase().includes(term) ||
        id.toLowerCase().includes(term) ||
        fecha.includes(term) ||
        total.includes(term)
      );
    });
  }

  // Eliminar orden
  async deleteOrder(orderId: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar pedido',
      message: '¿Estás seguro que quieres eliminar este pedido?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const { error } = await this.ordersService.deleteOrder(orderId);
        if (error) {
          console.error('Error al eliminar la orden:', error);
        } else {
          this.orders = this.orders.filter((order) => order.id !== orderId);
        }
      }
    });
  }

  abrirDialogoEstado(orderId: string, estadoActual: string) {
    const dialogRef = this.dialog.open(CambiarEstadoDialogComponent, {
      width: '400px',
      data: { estadoActual },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.updateEstado(orderId, resultado);
      }
    });
  }

  // Actualizar estado de la orden
  updateEstado(orderId: string, estado: 'confirmado' | 'cancelado') {
    this.ordersService.updateOrderStatus(orderId, estado).then(({ error }) => {
      if (error) {
        console.error('Error updating status', error);
      } else {
        this.getOrders(this.brand);
      }
    });
  }

  // Obtener estado legible

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

  // Manejo de dropdowns (menú desplegable)
  openDropdownId: string | null = null;

  toggleDropdown(id: string) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  selectOption() {
    this.openDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  closeAllOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside =
      target.closest('[id^="dropdownButton-"]') ||
      target.closest('.dropdown-menu');
    if (!clickedInside) {
      this.openDropdownId = null;
    }
  }

  // Paginación
  itemsPerPage = 10;
  currentPage = 1;

  paginatedOrders(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders().slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders().length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
}

import { Component } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css',
})
export class AdminNotificationsComponent {
  hayPedidosPendientes = false;
  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notificationService.pendingOrdersCount$.subscribe((pedidos) => {
      this.hayPedidosPendientes = pedidos > 0;
    });
  }
}

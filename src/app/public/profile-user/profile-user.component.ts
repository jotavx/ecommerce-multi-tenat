import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent } from '../../shared/components/dialogs/edit-profile-dialog/edit-profile-dialog.component';
import { EditBusinessDialogComponent } from '../../shared/components/dialogs/edit-business-dialog/edit-business-dialog.component';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.css',
})
export class ProfileUserComponent implements OnInit {
  user: any;
  business: any;
  historialPedidos: any[] = [];
  loading = true;
  notUser: string | null = null;
  notBusiness: string | null = null;
  orderItemsMap: { [orderId: string]: any[] } = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user) => {
      if (user) {
        const userId = user.id;

        this.userService.getUserProfile(userId).subscribe({
          next: (response) => {
            this.user = response.data;
            this.loading = false;
          },
          error: () => {
            this.notUser = 'Error al obtener los datos del usuario.';
            this.loading = false;
          },
        });

        this.userService.getBusinessProfile(userId).subscribe({
          next: (response) => {
            this.business = response.data;
            this.loading = false;
          },
          error: () => {
            this.notBusiness = 'Error al obtener datos del negocio';
            this.loading = false;
          },
        });
      } else {
        this.notUser = 'No hay sesión iniciada.';
        this.loading = false;
      }
    });
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

  editarPerfilUsuario() {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '400px',
      data: { ...this.user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = this.user.id;
        (async () => {
          try {
            await this.userService.updateUserProfile(userId, result);
            this.user = { ...this.user, ...result };
          } catch (error: any) {
            console.error('Error al actualizar el perfil:', error.message);
          }
        })();
      }
    });
  }

  editarNegocioUsuario() {
    const dialogRef = this.dialog.open(EditBusinessDialogComponent, {
      width: '400px',
      data: { ...this.business },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const userId = this.user.id;
        (async () => {
          try {
            await this.userService.updateBusinessProfile(userId, result);
            this.business = { ...this.business, ...result };
          } catch (error: any) {
            console.error('Error al actualizar el perfil:', error.message);
          }
        })();
      }
    });
  }

  //Si vamos a eliminar el flujo del comprobante la siguiente función no debe estar.
  async verComprobante(orderId: string) {
    const url = await this.ordersService.getComprobanteUrl(orderId);
    if (url) {
      window.open(url, '_blank'); // Abre el link en una nueva pestaña
    } else {
      console.error('No se pudo obtener el comprobante.');
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
}

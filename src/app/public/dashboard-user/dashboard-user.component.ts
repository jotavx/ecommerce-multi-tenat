import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.css',
})
export class DashboardUserComponent {
  isUser: boolean = false;
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  // ngOnInit() {
  //   this.loading = true;
  //   this.authService
  //     .isUserAdmin()
  //     .then((result) => {
  //       this.isUser = result;
  //       this.loading = false;
  //     })
  //     .catch((error) => {
  //       console.log('Error al obtener rol de usuario:', error);
  //       this.loading = false;
  //     });
  // }
}

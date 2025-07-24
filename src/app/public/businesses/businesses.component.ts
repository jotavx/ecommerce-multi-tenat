import { Component } from '@angular/core';
import { BusinessService } from '../../core/services/business.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.component.html',
  styleUrl: './businesses.component.css',
})
export class BusinessesComponent {
  businesses: any[] = [];

  constructor(
    private userService: UserService,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    this.businessService.clearCache();
    this.getAllBusiness();
  }

  getAllBusiness() {
    this.businessService.getAllBusinesses().then((result) => {
      if (result) {
        this.businesses = result;
      } else {
        console.error('No se encontraron negocios');
        this.businesses = [];
      }
    });
  }
}

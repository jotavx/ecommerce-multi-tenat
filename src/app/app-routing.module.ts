import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './public/register/register.component';
import { LoginComponent } from './public/login/login.component';
import { HomeComponent } from './public/home/home.component';
import { CompleteProfileComponent } from './public/complete-profile/complete-profile.component';
import { profileGuard } from './core/guards/auth/profile.guard';
import { CartComponent } from './public/cart/cart.component';
import { OrdersManagerComponent } from './admin/orders-manager/orders-manager.component';
import { OrdersDetailComponent } from './admin/orders-detail/orders-detail.component';
import { AdminGuard } from './core/guards/auth/admin.guard';
import { CheckoutFormComponent } from './public/checkout-form/checkout-form.component';
import { DashboardUserComponent } from './public/dashboard-user/dashboard-user.component';
import { ProductListComponent } from './public/product-list/product-list.component';
import { CategoriesListComponent } from './public/categories-list/categories-list.component';
import { ProductDetailComponent } from './public/product-detail/product-detail.component';
import { VariantsProductsManagerComponent } from './admin/variants-products-manager/variants-products-manager.component';
import { CategoryManagerComponent } from './admin/category-manager/category-manager.component';
import { ProductManagerComponent } from './admin/product-manager/product-manager.component';
import { ConfigComponent } from './admin/config/config.component';
import { RegisterSuccessComponent } from './public/register-success/register-success.component';
import { CheckoutComponent } from './public/checkout/checkout.component';

const routes: Routes = [
  // BRAND ROUTES
  {
    path: 'tienda/:brand',
    component: CategoriesListComponent,
    data: { publicView: true },
  },
  {
    path: 'tienda/:brand/categorias/:id',
    component: ProductListComponent,
    data: { publicView: true },
  },
  {
    path: 'tienda/:brand/producto/:id',
    component: ProductDetailComponent,
    data: { publicView: true },
  },
  {
    path: 'tienda/:brand/cart',
    component: CartComponent,
    data: { publicView: true },
  },
  //Checkout con comprobante
  // { path: 'tienda/:brand/checkout', component: CheckoutFormComponent },

  //Checkout sin comprobante
  { path: 'tienda/:brand/checkout', component: CheckoutComponent },
  {
    path: 'tienda/:brand/dashboard-user',
    component: DashboardUserComponent,
  },
  {
    path: 'tienda/:brand/orders/:id',
    component: OrdersDetailComponent,
  },

  // ADMIN ROUTES
  {
    path: 'tienda/:brand/orders-manager',
    component: OrdersManagerComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'tienda/:brand/categories-manager',
    component: CategoryManagerComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'tienda/:brand/products-manager',
    component: ProductManagerComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'tienda/:brand/variants-products-manager',
    component: VariantsProductsManagerComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'variants-products-manager/:id',
    component: VariantsProductsManagerComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'tienda/:brand/config',
    component: ConfigComponent,
    canActivate: [AdminGuard],
  },

  /// PUBLIC ROUTES
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [profileGuard],
  },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'register-success',
    component: RegisterSuccessComponent,
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'top', // <-- Esto resetea el scroll
  anchorScrolling: 'enabled', // Opcional, si usás anclas
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

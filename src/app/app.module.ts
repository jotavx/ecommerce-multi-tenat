import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientModule } from '@angular/common/http';

import { RegisterComponent } from './public/register/register.component';
import { LoginComponent } from './public/login/login.component';
import { HomeComponent } from './public/home/home.component';
import { CompleteProfileComponent } from './public/complete-profile/complete-profile.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { MainContainerComponent } from './shared/layout/main-container/main-container.component';
import { ProfileUserComponent } from './public/profile-user/profile-user.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProductManagerComponent } from './admin/product-manager/product-manager.component';
import { CategoryManagerComponent } from './admin/category-manager/category-manager.component';
import { ConfirmDialogComponent } from './shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CartComponent } from './public/cart/cart.component';
import { ProductListComponent } from './public/product-list/product-list.component';
import { OrdersManagerComponent } from './admin/orders-manager/orders-manager.component';
import { OrdersDetailComponent } from './admin/orders-detail/orders-detail.component';
import { TrackOrderComponent } from './public/track-order/track-order.component';
import { EditProfileDialogComponent } from './shared/components/dialogs/edit-profile-dialog/edit-profile-dialog.component';
import { CheckoutFormComponent } from './public/checkout-form/checkout-form.component';
import { TrackCodeComponent } from './public/track-code/track-code.component';
import { DashboardUserComponent } from './public/dashboard-user/dashboard-user.component';
import { CategoriesListComponent } from './public/categories-list/categories-list.component';
import { ProductDetailComponent } from './public/product-detail/product-detail.component';
import { AdminNotificationsComponent } from './shared/components/notification-panel/admin-notifications/admin-notifications.component';
import { CambiarEstadoDialogComponent } from './shared/components/dialogs/cambiar-estado-dialog/cambiar-estado-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { VariantsProductsManagerComponent } from './admin/variants-products-manager/variants-products-manager.component';
import { VariantDialogComponent } from './shared/components/dialogs/variant-dialog/variant-dialog.component';
import { CustomPriceDialogComponent } from './shared/components/dialogs/custom-price-dialog/custom-price-dialog.component';
import { HorarioAdminComponent } from './admin/horario-admin/horario-admin.component';
import { ConfigComponent } from './admin/config/config.component';

import { ChoiceDialogComponent } from './shared/components/dialogs/choice-dialog/choice-dialog.component';
import { CategoryDialogComponent } from './shared/components/dialogs/category-dialog/category-dialog.component';
import { ProductDialogComponent } from './shared/components/dialogs/product-dialog/product-dialog.component';
import { BusinessesComponent } from './public/businesses/businesses.component';
import { RegisterSuccessComponent } from './public/register-success/register-success.component';
import { EditBusinessDialogComponent } from './shared/components/dialogs/edit-business-dialog/edit-business-dialog.component';
import { CheckoutComponent } from './public/checkout/checkout.component';
import { MetodosPagoComponent } from './admin/metodos-pago/metodos-pago.component';
import { FormasEntregaComponent } from './admin/formas-entrega/formas-entrega.component';
import { PaymentComponent } from './public/payment/payment.component';
import { ChoiceOptionsDialogComponent } from './shared/components/dialogs/choice-options-dialog/choice-options-dialog.component';
import { CountdownComponent } from './admin/countdown/countdown.component';
import { DeleteAccountComponent } from './admin/delete-account/delete-account.component';
@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    CompleteProfileComponent,
    SpinnerComponent,
    MainContainerComponent,
    ProfileUserComponent,
    DashboardComponent,
    ProductManagerComponent,
    CategoryManagerComponent,
    ProductDialogComponent,
    CategoryDialogComponent,
    ConfirmDialogComponent,
    NavbarComponent,
    CartComponent,
    ProductListComponent,
    OrdersManagerComponent,
    OrdersDetailComponent,
    TrackOrderComponent,
    EditProfileDialogComponent,
    CheckoutFormComponent,
    TrackCodeComponent,
    DashboardUserComponent,
    CategoriesListComponent,
    ProductDetailComponent,
    AdminNotificationsComponent,
    CambiarEstadoDialogComponent,
    VariantsProductsManagerComponent,
    VariantDialogComponent,
    ChoiceDialogComponent,
    CustomPriceDialogComponent,
    HorarioAdminComponent,
    ConfigComponent,
    BusinessesComponent,
    RegisterSuccessComponent,
    EditBusinessDialogComponent,
    CheckoutComponent,
    MetodosPagoComponent,
    FormasEntregaComponent,
    PaymentComponent,
    ChoiceOptionsDialogComponent,
    CountdownComponent,
    DeleteAccountComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTabsModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatExpansionModule,
    HttpClientModule,
  ],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { Component } from '@angular/core';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanService } from '../../core/services/plans.service';
import { SubscriptionService } from '../../core/services/subscription.service';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  loading = false;
  error: string | null = null;
  plans: any[] = [];
  userId: string | null = null;
  isActive: boolean = false;
  subscriptionExpiresAt: string | null = null; // <-- NUEVA PROPIEDAD

  constructor(
    private paymentService: PaymentService,
    private subscriptionService: SubscriptionService,
    private planService: PlanService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      await this.getUserId();
      if (this.userId) {
        await this.subscriptionService
          .getUserSubscription(this.userId)
          .then((result) => {
            if (result === true) {
              this.isActive = true;
            } else {
              this.getPlans();
              this.isActive = false;
            }
          });
        if (this.isActive === true) {
          this.subscriptionExpiresAt =
            await this.subscriptionService.getUserSubscriptionExpire(
              this.userId
            );
        }
      }
    } finally {
      this.loading = false;
    }
  }

  getPlans() {
    this.loading = true;
    this.planService
      .getPlans()
      .then((result: any) => {
        this.plans = result;
        this.loading = false;
      })
      .catch((error) => {
        console.log('Error getPlans:', error);
        this.loading = false;
      });
  }

  async getUserId() {
    await this.authService
      .getUserId()
      .then((result) => {
        this.userId = result;
      })
      .catch((error) => {
        console.log('Error al obtener ID del usuario:', error);
      });
  }

  async pagar(tipo: 'monthly' | 'annual') {
    this.loading = true;
    this.error = null;

    try {
      const {
        data: { user },
        error,
      } = await this.authService.supabase.auth.getUser();

      if (error || !user?.email || !user?.id) {
        this.error = 'No se pudo obtener la información del usuario';
        this.loading = false;
        return;
      }

      this.paymentService
        .createPaymentLink(tipo, user.email, user.id)
        .subscribe({
          next: (link) => {
            window.location.href = link;
          },
          error: (err) => {
            console.error('Error al generar link de pago:', err);
            this.error = 'Ocurrió un error al generar el link de pago.';
            this.loading = false;
          },
        });
    } catch (e) {
      this.error = 'Error inesperado al iniciar el pago.';
      this.loading = false;
    }
  }
}

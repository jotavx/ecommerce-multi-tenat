/**
 * Componente: CountdownComponent
 * -------------------------------------------
 * Este componente muestra una cuenta regresiva (countdown)
 * correspondiente al período de gracia de una suscripción de usuario.
 *
 * 🔹 Flujo general:
 * 1. En el ciclo de vida `ngOnInit()`, se obtiene el ID del usuario autenticado
 *    mediante `AuthService.getUserId()`.
 * 2. Luego se consulta la fecha de expiración de su suscripción
 *    a través de `SubscriptionService.getUserExpiredAt(userId)`.
 * 3. Si existe una fecha de expiración (`expiredAt`), se calcula el fin del
 *    período de gracia sumando 3 días (72 horas) a esa fecha.
 * 4. Se inicia un intervalo (`setInterval`) que actualiza cada segundo
 *    la diferencia entre la hora actual y el final del período de gracia.
 * 5. El resultado se formatea en días, horas, minutos y segundos
 *    y se muestra en la propiedad `countdown`, que se renderiza en la vista.
 * 6. Si el tiempo llega a cero, se detiene el intervalo y se muestra el mensaje
 *    “El período de gracia terminó”.
 *
 * 🔸 Además:
 * - Se utiliza el pipe `GracePeriodPipe` para obtener un mensaje descriptivo
 *   sobre el estado del período de gracia (por ejemplo, si aún está vigente o expiró).
 * - En el método `ngOnDestroy()`, se limpia el intervalo para evitar fugas de memoria.
 *
 * 🔧 Dependencias inyectadas:
 * - `AuthService`: Maneja la autenticación y provee el ID del usuario.
 * - `SubscriptionService`: Gestiona la información de suscripción y fechas de expiración.
 * - `GracePeriodPipe`: Formatea mensajes relacionados con el período de gracia.
 *
 * 💡 Nota:
 * El método `ngOnInit()` está comentado actualmente, pero contiene la lógica principal
 * del conteo regresivo. Puede reactivarse según las necesidades del flujo.
 *
 * Actualmente desactivado por que genera simultaneas y repetidas peticiónes a la base de datos, implementar cache o localStorage para mejorar el rendimiento
 */

import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { GracePeriodPipe } from '../../shared/pipes/grace-period.pipe';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.css',
  providers: [GracePeriodPipe],
})
export class CountdownComponent {
  userId: any | null = null;
  countdown: string = '';
  intervalId: any;
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private gracePipe: GracePeriodPipe // inyección tradicional
  ) {}

  // async ngOnInit(): Promise<void> {
  //   await this.authService
  //     .getUserId()
  //     .then((result) => {
  //       this.userId = result;
  //     })
  //     .catch((error) => {
  //       console.log('Error al obtener userID:', error);
  //     });

  //   const expiredAtStr = await this.subscriptionService.getUserExpiredAt(
  //     this.userId
  //   );
  //   if (!expiredAtStr) return;

  //   this.mensaje = this.gracePipe.transform(expiredAtStr);

  //   const expiredAt = new Date(expiredAtStr);
  //   const gracePeriodEnd = new Date(
  //     expiredAt.getTime() + 3 * 24 * 60 * 60 * 1000
  //   );

  //   this.intervalId = setInterval(() => {
  //     const now = new Date();
  //     const diff = gracePeriodEnd.getTime() - now.getTime();

  //     if (diff <= 0) {
  //       this.countdown = 'El período de gracia terminó';
  //       clearInterval(this.intervalId);
  //     } else {
  //       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  //       const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  //       const minutes = Math.floor((diff / (1000 * 60)) % 60);
  //       const seconds = Math.floor((diff / 1000) % 60);

  //       this.countdown = `${this.pad(days)}d ${this.pad(hours)}h ${this.pad(
  //         minutes
  //       )}m ${this.pad(seconds)}s`;
  //     }
  //   }, 1000);
  // }

  // pad(n: number): string {
  //   return n < 10 ? '0' + n : n.toString();
  // }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gracePeriod',
})
export class GracePeriodPipe implements PipeTransform {
  transform(expiredAtStr: string | null): string {
    if (!expiredAtStr) return '';

    const expiredAt = new Date(expiredAtStr);
    const graceEnd = new Date(expiredAt.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const diffInMs = graceEnd.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 1) {
      return `Faltan ${diffInDays} días`;
    } else if (diffInDays === 1) {
      return 'Último día';
    } else if (diffInDays === 0) {
      return 'Últimas horas';
    } else {
      return 'Expirado';
    }
  }
}

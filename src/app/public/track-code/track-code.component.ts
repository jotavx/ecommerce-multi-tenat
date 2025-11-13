import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBarService } from '../../core/services/snackbar.service';

interface CodigoGuardado {
  codigo: string;
  fechaCreacion: string;
  nombreNegocio: string;
}

@Component({
  selector: 'app-track-code',
  templateUrl: './track-code.component.html',
  styleUrl: './track-code.component.css',
})
export class TrackCodeComponent {
  codigos: CodigoGuardado[] = [];
  ultimoCodigo: CodigoGuardado | null = null;

  constructor(private snackbar: SnackBarService) {}

  ngOnInit() {
    const veinticuatroHorasEnMs = 24 * 60 * 60 * 1000;
    const ahora = Date.now();

    // Procesar codigos_seguimiento
    const raw = localStorage.getItem('codigos_seguimiento');
    if (raw) {
      const guardados: CodigoGuardado[] = JSON.parse(raw);

      const vigentes = guardados.filter((entry) => {
        const fecha = new Date(entry.fechaCreacion).getTime();
        return ahora - fecha <= veinticuatroHorasEnMs;
      });

      localStorage.setItem('codigos_seguimiento', JSON.stringify(vigentes));
      this.codigos = vigentes;
    }

    // Procesar ultimo_codigo
    const ultimo = localStorage.getItem('ultimo_codigo');
    if (ultimo) {
      try {
        const parsed: CodigoGuardado = JSON.parse(ultimo);
        const fecha = new Date(parsed.fechaCreacion).getTime();
        if (ahora - fecha <= veinticuatroHorasEnMs) {
          this.ultimoCodigo = parsed;
        } else {
          localStorage.removeItem('ultimo_codigo');
        }
      } catch {
        localStorage.removeItem('ultimo_codigo');
      }
    }
  }

  copiar(codigo: string) {
    navigator.clipboard.writeText(codigo).then(() => {
      this.snackbar.openSnackBar('Código copiado al portapapeles', 'Cerrar');
    });
  }
}

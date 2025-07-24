import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-track-code',
  templateUrl: './track-code.component.html',
  styleUrl: './track-code.component.css',
})
export class TrackCodeComponent {
  codigos: string[] = [];
  ultimoCodigo: string | null = null;

  ngOnInit() {
    // const treintaSegundosEnMs = 30 * 1000;

    const veinticuatroHorasEnMs = 24 * 60 * 60 * 1000;
    const ahora = Date.now();

    // Procesar codigos_seguimiento
    const raw = localStorage.getItem('codigos_seguimiento');
    if (raw) {
      const guardados: { codigo: string; fechaCreacion: string }[] =
        JSON.parse(raw);

      const vigentes = guardados.filter((entry) => {
        const fecha = new Date(entry.fechaCreacion).getTime();
        return ahora - fecha <= veinticuatroHorasEnMs; ////////////////////////// Aca poné veinticuatroHorasEnMs cuando vayas a produ
      });

      localStorage.setItem('codigos_seguimiento', JSON.stringify(vigentes));
      this.codigos = vigentes.map((c) => c.codigo);
    } else {
      this.codigos = [];
    }

    // Procesar ultimo_codigo con vencimiento
    const ultimo = localStorage.getItem('ultimo_codigo');
    if (ultimo) {
      try {
        const { codigo, fechaCreacion } = JSON.parse(ultimo);
        const fecha = new Date(fechaCreacion).getTime();
        if (ahora - fecha <= veinticuatroHorasEnMs) {
          this.ultimoCodigo = codigo;
        } else {
          localStorage.removeItem('ultimo_codigo');
          this.ultimoCodigo = null;
        }
      } catch {
        // Si no es un objeto válido (por backward compatibility), lo borramos
        localStorage.removeItem('ultimo_codigo');
        this.ultimoCodigo = null;
      }
    } else {
      this.ultimoCodigo = null;
    }
  }

  copiar(codigo: string) {
    navigator.clipboard.writeText(codigo).then(() => {
      alert(`Código ${codigo} copiado al portapapeles`);
    });
  }
}

// cambiar-estado-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cambiar-estado-dialog',
  templateUrl: './cambiar-estado-dialog.component.html',
})
export class CambiarEstadoDialogComponent {
  selectedEstado: string = '';

  estados = [
    { value: 'en_preparacion', label: 'En preparación' },
    { value: 'listo', label: 'Listo para envío/entrega' },
    { value: 'en_camino', label: 'En camino' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'reembolsado', label: 'Reembolsado' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CambiarEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.selectedEstado) {
      this.dialogRef.close(this.selectedEstado);
    }
  }
}

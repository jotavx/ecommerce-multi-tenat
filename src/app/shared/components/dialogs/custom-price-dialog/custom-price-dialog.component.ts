import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-price-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Precio</mat-label>
        <input
          matInput
          type="number"
          [(ngModel)]="price"
          name="precio"
          required
          #precio="ngModel"
        />
        <mat-error *ngIf="precio.invalid && precio.touched"
          >El precio es obligatorio</mat-error
        >
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="precio.invalid"
      >
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class CustomPriceDialogComponent {
  price: number;

  constructor(
    public dialogRef: MatDialogRef<CustomPriceDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      defaultPrice: number;
      title: string;
      message: string;
    }
  ) {
    this.price = data.defaultPrice;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.price);
  }
}

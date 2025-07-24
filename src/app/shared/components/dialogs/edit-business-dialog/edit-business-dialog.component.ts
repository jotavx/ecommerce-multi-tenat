import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-business-dialog',
  templateUrl: './edit-business-dialog.component.html',
  styleUrl: './edit-business-dialog.component.css',
})
export class EditBusinessDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditBusinessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nombre_negocio: [data.nombre_negocio, Validators.required],

      //new
      brand: [data.brand, Validators.required],
      //new

      telefono: [data.telefono],
      email: [data.email],
      //Agregar ubicación del negocio!!!
      descripcion: [data.descripcion],
      logo_url: [data.logo_url],
      //Si vamos a eliminar el flujo del comprobante de pago el alias no debe estar.
      alias_negocio: [data.alias_negocio],
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

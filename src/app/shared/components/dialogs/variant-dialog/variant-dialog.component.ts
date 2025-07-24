import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VariantsProducts } from '../../../../core/services/variants-products.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-variant-dialog',
  templateUrl: './variant-dialog.component.html',
})
export class VariantDialogComponent {
  @ViewChild('form') form!: NgForm;
  name: string = '';

  constructor(
    private dialogRef: MatDialogRef<VariantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { variant?: any },
    private variantsService: VariantsProducts
  ) {
    if (data.variant) {
      this.name = data.variant.name;
    }
  }

  async save() {
    if (this.data.variant) {
      await this.variantsService.updateVariant(this.data.variant.id, {
        name: this.name,
      });
    } else {
      // productoId es opcional si son variantes globales
      await this.variantsService.createVariant(this.name);
    }
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}

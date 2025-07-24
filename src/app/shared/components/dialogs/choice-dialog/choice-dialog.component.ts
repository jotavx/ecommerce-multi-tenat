// import { Component, Inject, OnInit } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { VariantsProducts } from '../../../../core/services/variants-products.service';

// @Component({
//   selector: 'app-choice-dialog',
//   templateUrl: './choice-dialog.component.html',
// })
// export class ChoiceDialogComponent implements OnInit {
//   name: string = '';

//   options: any[] = [];
//   newOptionName = '';
//   newOptionPrice = 0;
//   newOptionStock = false;
//   newOptionCounter = false; // Para la nueva opción con contador
//   maxQuantity: number | null = null;
//   obligatorio = false;

//   seleccionMultiple: boolean = false; // Para la opción múltiple

//   constructor(
//     private dialogRef: MatDialogRef<ChoiceDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { choice?: any },
//     private variantsService: VariantsProducts
//   ) {
//     if (data.choice) {
//       this.name = data.choice.name;
//       this.seleccionMultiple = data.choice.seleccionMultiple; // 💡 nuevo
//       this.maxQuantity = data.choice.maxQuantity ?? null;
//       this.obligatorio = this.data.choice.obligatorio ?? false;
//     }
//   }

//   async ngOnInit() {
//     if (this.data.choice) {
//       this.options = await this.variantsService.getChoiceOptionsByChoiceId(
//         this.data.choice.id
//       );
//     }
//   }

//   get hasCounterOption(): boolean {
//     return (
//       Array.isArray(this.options) && this.options.some((opt) => opt.counter)
//     );
//   }

//   async save() {
//     const hasCounter = this.options.some((opt) => opt.counter);

//     if (this.data.choice) {
//       await this.variantsService.updateChoice(this.data.choice.id, {
//         name: this.name,
//         seleccionMultiple: this.seleccionMultiple,
//         maxQuantity:
//           this.seleccionMultiple && hasCounter ? this.maxQuantity : null,
//         obligatorio: this.obligatorio,
//       });
//     } else {
//       await this.variantsService.createChoice(
//         this.name,
//         this.seleccionMultiple,
//         this.seleccionMultiple && hasCounter ? this.maxQuantity : null
//       );
//     }

//     this.dialogRef.close(true);
//   }

//   async addOption() {
//     if (!this.newOptionName || !this.data.choice?.id) return;

//     await this.variantsService.createChoiceOption(
//       this.data.choice.id,
//       this.newOptionName,
//       this.newOptionPrice,
//       this.newOptionStock,
//       this.newOptionCounter
//     );

//     this.options = await this.variantsService.getChoiceOptionsByChoiceId(
//       this.data.choice.id
//     );
//     this.newOptionName = '';
//     this.newOptionPrice = 0;
//     this.newOptionStock = false;
//     this.newOptionCounter = false;
//   }

//   async updateOption(option: any) {
//     await this.variantsService.updateChoiceOption(option.id, {
//       name: option.name,
//       price: option.price,
//       stock: option.stock,
//       counter: option.counter ?? false, // por si viene vacío
//     });
//   }

//   async deleteOption(optionId: string) {
//     await this.variantsService.deleteChoiceOption(optionId);
//     this.options = await this.variantsService.getChoiceOptionsByChoiceId(
//       this.data.choice.id
//     );
//   }
// }

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { VariantsProducts } from '../../../../core/services/variants-products.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-choice-dialog',
  templateUrl: './choice-dialog.component.html',
})
export class ChoiceDialogComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  name: string = '';
  options: any[] = [];
  newOptionName = '';
  newOptionPrice = 0;
  newOptionStock = false;
  newOptionCounter = false;
  newOptionRequiredMax = false;
  maxQuantity: number | null = null;
  obligatorio = false;
  seleccionMultiple: boolean = false;
  hasUnsavedChanges = false;

  constructor(
    private dialogRef: MatDialogRef<ChoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { choice?: any },
    private variantsService: VariantsProducts,
    private dialog: MatDialog
  ) {
    if (data.choice) {
      this.name = data.choice.name;
      this.seleccionMultiple = data.choice.seleccionMultiple;
      this.maxQuantity = this.data.choice.maxQuantity ?? null;
      this.newOptionRequiredMax =
        this.data.choice.requerirMaxParaContinuar ?? false;
      this.obligatorio = this.data.choice.obligatorio ?? false;
    }
  }

  async ngOnInit() {
    if (this.data.choice) {
      this.options = await this.variantsService.getChoiceOptionsByChoiceId(
        this.data.choice.id
      );
    }

    //AHORA USAMOS closeDialog() Mucho mejor

    // this.dialogRef.beforeClosed().subscribe(async (result) => {
    //   if (result === true || !this.hasUnsavedChanges) return;

    //   const confirm = await this.dialog
    //     .open(ConfirmDialogComponent, {
    //       data: {
    //         title: '¿Salir sin guardar?',
    //         message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
    //         cancelText: 'Cancelar',
    //         confirmText: 'Salir sin guardar',
    //       },
    //     })
    //     .afterClosed()
    //     .toPromise();

    //   if (!confirm) {
    //     this.dialogRef.disableClose = true;
    //   } else {
    //     this.dialogRef.disableClose = false;
    //     this.dialogRef.close();
    //   }
    // });
  }

  closeDialog() {
    if (!this.hasUnsavedChanges) {
      this.dialogRef.close();
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: '¿Salir sin guardar?',
          message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
          cancelText: 'Cancelar',
          confirmText: 'Salir sin guardar',
        },
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.dialogRef.close(); // solo si el usuario acepta
        }
      });
  }

  get hasCounterOption(): boolean {
    return (
      Array.isArray(this.options) && this.options.some((opt) => opt.counter)
    );
  }

  // async save() {
  //   const hasCounter = this.options.some((opt) => opt.counter);

  //   if (this.data.choice) {
  //     await this.variantsService.updateChoice(this.data.choice.id, {
  //       name: this.name,
  //       seleccionMultiple: this.seleccionMultiple,
  //       maxQuantity: this.maxQuantity,
  //       // this.seleccionMultiple && hasCounter ? this.maxQuantity : null,
  //       requerirMaxParaContinuar: this.newOptionRequiredMax,
  //       obligatorio: this.obligatorio,
  //     });
  // } else {
  //   await this.variantsService.createChoice(
  //     this.name,
  //     this.seleccionMultiple,
  //     this.seleccionMultiple && hasCounter ? this.maxQuantity : null
  //   );

  //     for (const opt of this.options) {
  //       await this.variantsService.updateChoiceOption(opt.id, {
  //         name: opt.name,
  //         price: opt.price,
  //         stock: opt.stock,
  //         counter: opt.counter ?? false,
  //       });
  //     }
  //   }

  //   this.hasUnsavedChanges = false;
  //   this.dialogRef.close(true);
  // }

  async save() {
    const hasCounter = this.options.some((opt) => opt.counter);

    if (this.data.choice) {
      await this.variantsService.updateChoice(this.data.choice.id, {
        name: this.name,
        seleccionMultiple: this.seleccionMultiple,
        maxQuantity: this.maxQuantity,
        requerirMaxParaContinuar: this.newOptionRequiredMax,
        obligatorio: this.obligatorio,
      });
    } else {
      const newChoice = await this.variantsService.createChoice(this.name);

      this.data.choice = newChoice;
    }

    for (const opt of this.options) {
      await this.variantsService.updateChoiceOption(opt.id, {
        name: opt.name,
        price: opt.price,
        stock: opt.stock,
        counter: opt.counter ?? false,
      });
    }

    this.hasUnsavedChanges = false;
    this.dialogRef.close(true);
  }

  async addOption() {
    if (!this.newOptionName || !this.data.choice?.id) return;

    await this.variantsService.createChoiceOption(
      this.data.choice.id,
      this.newOptionName,
      this.newOptionPrice
      // this.newOptionStock,
      // this.newOptionCounter
    );

    this.options = await this.variantsService.getChoiceOptionsByChoiceId(
      this.data.choice.id
    );
    this.newOptionName = '';
    this.newOptionPrice = 0;
    this.newOptionStock = false;
    this.newOptionCounter = false;
    this.hasUnsavedChanges = true;
  }

  async deleteOption(optionId: string) {
    await this.variantsService.deleteChoiceOption(optionId);
    this.options = await this.variantsService.getChoiceOptionsByChoiceId(
      this.data.choice.id
    );
    this.hasUnsavedChanges = true;
  }

  onOptionChange(option: any, field: string, value: any) {
    option[field] = value;
    this.hasUnsavedChanges = true;
  }

  onFieldChange(field: string, value: any) {
    if (field === 'seleccionMultiple' && !value) {
      // Si se desactiva selección múltiple, quitar los counters
      for (const opt of this.options) {
        opt.counter = false;
      }
    }

    (this as any)[field] = value;
    this.hasUnsavedChanges = true;
  }
}

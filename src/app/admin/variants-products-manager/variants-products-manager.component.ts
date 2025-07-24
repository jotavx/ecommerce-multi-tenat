import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { VariantsProducts } from '../../core/services/variants-products.service';
import { ProductService } from '../../core/services/products.service';
import { VariantDialogComponent } from '../../shared/components/dialogs/variant-dialog/variant-dialog.component';
import { CustomPriceDialogComponent } from '../../shared/components/dialogs/custom-price-dialog/custom-price-dialog.component';
import { ChoiceDialogComponent } from '../../shared/components/dialogs/choice-dialog/choice-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

interface Variant {
  id: string;
  name: string;
  price: number;
  custom_price?: number;
}

interface Choice {
  id: string;
  name: string;
  choice_options?: Array<{
    name: string;
    price: number;
    stock?: boolean;
  }>;
}

@Component({
  selector: 'app-variants-products-manager',
  templateUrl: './variants-products-manager.component.html',
  styleUrls: ['./variants-products-manager.component.css'],
})
export class VariantsProductsManagerComponent implements OnInit {
  loading = false;
  productName = '';
  selectedProductId = '';

  allVariants: Variant[] = [];
  allChoices: Choice[] = [];

  assignedVariants: Variant[] = [];
  assignedChoices: Choice[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private variantsService: VariantsProducts,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.loading = true;
      this.selectedProductId = params.get('id') || '';

      try {
        await this.loadData();
        if (this.selectedProductId) {
          this.getProductNameById(this.selectedProductId);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        this.loading = false;
      }
    });
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadVariantsAndChoices(),
      this.selectedProductId ? this.loadAssignedData() : Promise.resolve(),
    ]);
  }

  private async loadVariantsAndChoices(): Promise<void> {
    try {
      [this.allVariants, this.allChoices] = await Promise.all([
        this.variantsService.getVariantsByBusiness(),
        this.variantsService.getChoicesByBusiness(),
      ]);
    } catch (error) {
      console.error('Error loading variants and choices:', error);
      throw error;
    }
  }

  private async loadAssignedData(): Promise<void> {
    try {
      const [variantsResult, choicesResult] = await Promise.all([
        this.variantsService.getVariantsByProduct(this.selectedProductId),
        this.variantsService.getChoicesByProduct(this.selectedProductId),
      ]);
      this.assignedVariants = variantsResult.map((v: any) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        custom_price: v.custom_price,
      }));
      this.assignedChoices = Array.isArray(choicesResult[0])
        ? choicesResult.flat().map((c: any) => ({
            id: c.id,
            name: c.name,
            choice_options: c.choice_options,
          }))
        : choicesResult.map((c: any) => ({
            id: c.id,
            name: c.name,
            choice_options: c.choice_options,
          }));
    } catch (error) {
      console.error('Error loading assigned data:', error);
      throw error;
    }
  }

  private getProductNameById(id: string): void {
    this.productService
      .getProductById(id)
      .then((result) => {
        this.productName = result.name;
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
      });
  }

  openVariantDialog(variant?: Variant): void {
    const dialogRef = this.dialog.open(VariantDialogComponent, {
      data: { variant },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadVariantsAndChoices();
    });
  }

  openChoiceDialog(choice?: Choice): void {
    const dialogRef = this.dialog.open(ChoiceDialogComponent, {
      width: '900px',
      data: { choice },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadVariantsAndChoices();
    });
  }

  // async deleteVariant(variantId: string): Promise<void> {
  //   if (!confirm('¿Querés eliminar esta variante?')) return;

  //   try {
  //     await this.variantsService.deleteVariant(variantId);
  //     await this.loadVariantsAndChoices();
  //   } catch (error) {
  //     alert('Error al eliminar la variante');
  //     console.error(error);
  //   }
  // }

  deleteVariant(id: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar variante',
      message: '¿Estás seguro que quieres eliminar esta variante?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.variantsService
          .deleteVariant(id)
          .then(() => {
            //Snackbar aquí
            this.loadVariantsAndChoices();
          })
          .catch((error) => {
            console.error('Error al eliminar la variante:', error);
          });
      }
    });
  }

  // async deleteChoice(choiceId: string): Promise<void> {
  //   if (!confirm('¿Querés eliminar esta opción?')) return;

  //   try {
  //     await this.variantsService.deleteChoice(choiceId);
  //     await this.loadVariantsAndChoices();
  //   } catch (error) {
  //     alert('Error al eliminar la opción');
  //     console.error(error);
  //   }
  // }

  deleteChoice(id: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar opción',
      message: '¿Estás seguro que quieres eliminar esta opción?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.variantsService
          .deleteChoice(id)
          .then(() => {
            //Snackbar aquí
            this.loadVariantsAndChoices();
          })
          .catch((error) => {
            console.error('Error al eliminar la opción:', error);
          });
      }
    });
  }

  async assignVariant(variantId: string): Promise<void> {
    if (!this.selectedProductId) return;

    const variant = this.allVariants.find((v) => v.id === variantId);
    if (!variant) return;

    const dialogRef = this.dialog.open(CustomPriceDialogComponent, {
      data: {
        defaultPrice: variant.price,
        title: `Asignar "${variant.name}"`,
        message: 'Ingrese el precio para este producto:',
      },
    });

    dialogRef.afterClosed().subscribe(async (customPrice) => {
      if (customPrice !== undefined) {
        try {
          await this.variantsService.assignVariantToProduct(
            variantId,
            this.selectedProductId,
            customPrice
          );
          await this.loadAssignedData();
        } catch (err) {
          alert('Error al asignar variante');
          console.error(err);
        }
      }
    });
  }

  async updateVariantPrice(variant: Variant): Promise<void> {
    const dialogRef = this.dialog.open(CustomPriceDialogComponent, {
      data: {
        defaultPrice: variant.custom_price || variant.price,
        title: `Actualizar precio de "${variant.name}"`,
        message: 'Ingrese el nuevo precio:',
      },
    });

    dialogRef.afterClosed().subscribe(async (newPrice) => {
      if (newPrice !== undefined && this.selectedProductId) {
        try {
          await this.variantsService.updateVariantPriceForProduct(
            variant.id,
            this.selectedProductId,
            newPrice
          );
          await this.loadAssignedData();
        } catch (error) {
          alert('Error al actualizar precio');
          console.error(error);
        }
      }
    });
  }

  async assignChoice(choiceId: string): Promise<void> {
    try {
      await this.variantsService.assignChoiceToProduct(
        choiceId,
        this.selectedProductId
      );
      await this.loadAssignedData();
    } catch (err) {
      alert('Error al asignar opción');
      console.error(err);
    }
  }

  async unassignVariant(variantId: string): Promise<void> {
    if (!this.selectedProductId) return;

    try {
      await this.variantsService.unassignVariantFromProduct(
        variantId,
        this.selectedProductId
      );
      await this.loadAssignedData();
    } catch (error) {
      alert('Error al desasignar variante');
      console.error(error);
    }
  }

  async unassignChoice(choiceId: string): Promise<void> {
    if (!this.selectedProductId) return;

    try {
      await this.variantsService.unassignChoiceFromProduct(
        choiceId,
        this.selectedProductId
      );
      await this.loadAssignedData();
    } catch (error) {
      alert('Error al desasignar opción');
      console.error(error);
    }
  }

  isVariantAssigned(variantId: string): boolean {
    return this.assignedVariants.some((v) => v.id === variantId);
  }

  isChoiceAssigned(choiceId: string): boolean {
    return this.assignedChoices.some((c) => c.id === choiceId);
  }

  goBack(): void {
    history.back();
  }

  // Paginación para variantes
  variantsPage = 1;
  variantsPerPage = 5;

  // Paginación para opciones
  choicesPage = 1;
  choicesPerPage = 5;

  get paginatedVariants(): Variant[] {
    const start = (this.variantsPage - 1) * this.variantsPerPage;
    return this.allVariants.slice(start, start + this.variantsPerPage);
  }

  get totalVariantsPages(): number {
    return Math.ceil(this.allVariants.length / this.variantsPerPage);
  }

  nextVariantPage(): void {
    if (this.variantsPage < this.totalVariantsPages) this.variantsPage++;
  }

  prevVariantPage(): void {
    if (this.variantsPage > 1) this.variantsPage--;
  }

  get paginatedChoices(): Choice[] {
    const start = (this.choicesPage - 1) * this.choicesPerPage;
    return this.allChoices.slice(start, start + this.choicesPerPage);
  }

  get totalChoicesPages(): number {
    return Math.ceil(this.allChoices.length / this.choicesPerPage);
  }

  nextChoicePage(): void {
    if (this.choicesPage < this.totalChoicesPages) this.choicesPage++;
  }

  prevChoicesPage(): void {
    if (this.choicesPage > 1) this.choicesPage--;
  }
}

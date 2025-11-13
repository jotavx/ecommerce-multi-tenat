// delete-account.component.ts
import { Component } from '@angular/core';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css'],
})
export class DeleteAccountComponent {
  // Estados del componente
  showModal = false;
  confirmationText = '';
  isDeleting = false;
  errorMessage = '';

  // Texto que el usuario debe escribir para confirmar
  readonly CONFIRMATION_WORD = 'ELIMINAR';

  constructor(private accountService: AccountService) {}

  /**
   * Abre el modal de confirmación
   */
  openModal(): void {
    this.showModal = true;
    this.confirmationText = '';
    this.errorMessage = '';

    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal de confirmación
   */
  closeModal(): void {
    this.showModal = false;
    this.confirmationText = '';
    this.errorMessage = '';

    document.body.style.overflow = '';
  }

  /**
   * Verifica si el botón de eliminar debe estar habilitado
   */
  get isConfirmationValid(): boolean {
    return this.confirmationText.toUpperCase() === this.CONFIRMATION_WORD;
  }

  /**
   * Maneja la eliminación de la cuenta
   */
  async deleteAccount(): Promise<void> {
    if (!this.isConfirmationValid) {
      this.errorMessage = 'Debes escribir "ELIMINAR" para confirmar';
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    try {
      const result = await this.accountService.deleteAccount();

      if (!result.success) {
        this.errorMessage =
          'Error al eliminar la cuenta. Por favor, intenta nuevamente.';
        this.isDeleting = false;
      }
      // Si es exitoso, el usuario será redirigido automáticamente
    } catch (error) {
      this.errorMessage = 'Error inesperado. Por favor, contacta con soporte.';
      this.isDeleting = false;
    }
  }
}

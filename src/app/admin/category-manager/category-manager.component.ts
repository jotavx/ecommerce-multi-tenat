import { Component, HostListener, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { CategoryDialogComponent } from '../../shared/components/dialogs/category-dialog/category-dialog.component';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.css'],
})
export class CategoryManagerComponent implements OnInit {
  searchTerm: string = '';
  categories: any[] = [];
  loading = false;

  filteredCategories() {
    if (!this.searchTerm) return this.categories;
    const term = this.searchTerm.toLowerCase().trim();
    return this.categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.description.toLowerCase().includes(term)
    );
  }

  constructor(
    private categoryService: CategoryService,
    public dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading = true;
    try {
      this.categories = await this.categoryService.getMyBusinessCategories();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      this.loading = false;
    }
  }

  deleteCategory(id: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar categoría',
      message: '¿Estás seguro que quieres eliminar esta categoría?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Aquí llamás a tu método real para eliminar el producto
        this.categoryService
          .deleteCategory(id)
          .then(() => {
            this.categories = this.categories.filter((p) => p.id !== id);
          })
          .catch((error) => {
            console.error('Error al eliminar el producto:', error);
          });
        this.loadCategories();
      }
    });
  }

  async openCategoryDialog(category?: Category) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: category || null,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadCategories();
      }
    });
  }

  itemsPerPage = 10;
  currentPage = 1;

  paginatedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories().slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories().length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  openDropdownId: string | null = null;

  toggleDropdown(id: string) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  selectOption() {
    this.openDropdownId = null;
  }

  //Función para verificar si el producto está cerca del final de la lista
  isNearBottom(category: Category): boolean {
    const index = this.paginatedCategories().findIndex(
      (c) => c.id === category.id
    );
    return index >= this.paginatedCategories().length - 2;
  }

  @HostListener('document:click', ['$event'])
  closeAllOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside =
      target.closest('[id^="dropdownButton-"]') ||
      target.closest('.dropdown-menu');
    if (!clickedInside) {
      this.openDropdownId = null;
    }
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {PanelTypesStore} from '../../model/stores/panel-types.store';
import {PanelTypeEntity} from '../../../../entities/panel-type/model/panel-type.entity';

@Component({
  selector: 'app-panel-types',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  templateUrl: './panel-types.page.html'
})
export class PanelTypesPage implements OnInit {
  readonly store = inject(PanelTypesStore);
  private readonly router = inject(Router);

  // UI state para modal de confirmación
  readonly showDeleteModal = signal(false);
  readonly panelTypeToDelete = signal<PanelTypeEntity | null>(null);

  ngOnInit(): void {
    this.store.loadPanelTypes();
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

  onRefresh(): void {
    this.store.loadPanelTypes();
  }

  onView(panelType: PanelTypeEntity): void {
    // Si hay vista de detalles, navegar
    this.router.navigate(['/panel-types', panelType.id]);
  }

  onEdit(panelType: PanelTypeEntity): void {
    this.router.navigate(['/panel-types', panelType.id, 'edit']);
  }

  onDeleteClick(panelType: PanelTypeEntity): void {
    this.panelTypeToDelete.set(panelType);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const panelType = this.panelTypeToDelete();
    if (!panelType) return;

    // TODO: Llamar al servicio para eliminar
    console.log('Delete confirmed:', panelType);

    // Por ahora, solo removemos de la lista
    this.store.removePanelType(panelType.id);

    // Cerrar modal
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.panelTypeToDelete.set(null);
  }

  onCreateNew(): void {
    this.router.navigate(['/panel-types/new']);
  }

  /**
   * Genera color único basado en el código
   */
  getColorFromCode(code: string): string {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600'
    ];

    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  }
}

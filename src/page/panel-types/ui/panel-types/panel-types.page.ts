import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { PanelTypesStore } from '../../model/stores/panel-types.store';
import { PanelTypeEntity } from '../../../../entities/panel-type/model/panel-type.entity';

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

  onEdit(panelType: PanelTypeEntity): void {
    this.router.navigate(['/panel-types', panelType.id, 'edit']).then(() => {});
  }

  onDeleteClick(panelType: PanelTypeEntity): void {
    this.panelTypeToDelete.set(panelType);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const panelType = this.panelTypeToDelete();
    if (!panelType) return;
    this.store.removePanelType(panelType.id)
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.panelTypeToDelete.set(null);
  }

  onCreateNew(): void {
    this.router.navigate(['/panel-types/new']).then(() => {});
  }
}

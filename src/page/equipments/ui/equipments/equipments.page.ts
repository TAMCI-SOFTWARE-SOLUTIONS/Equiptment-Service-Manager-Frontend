import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {EquipmentCardComponent} from '../equipment-card/equipment-card.component';
import {EquipmentFiltersAsideComponent} from '../equipment-filters-aside/equipment-filters-aside.component';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {EquipmentsStore} from '../../model/equipments.store';
import {EquipmentEntity} from '../../../../entities/equipment/model/equipment.entity';
import {EquipmentStatusEnum, getEquipmentStatusLabel} from '../../../../entities/equipment/model/equipment-status.enum';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {getEquipmentTypeLabel} from '../../../../shared/model/enums/equipment-type.enum';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EquipmentCardComponent,
    EquipmentFiltersAsideComponent,
    ConfirmationModalComponent,
    EmptyStateComponent,
    Ripple
  ],
  templateUrl: './equipments.page.html'
})
export class EquipmentsPage implements OnInit {
  readonly store = inject(EquipmentsStore);
  private readonly router = inject(Router);

  // UI State
  readonly showFiltersAside = signal(false);
  readonly showDeleteModal = signal(false);
  readonly equipmentToDelete = signal<EquipmentEntity | null>(null);
  readonly isDeleting = signal(false);

  // Expose enums to template
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly EquipmentStatusEnum = EquipmentStatusEnum;

  ngOnInit(): void {
    this.store.loadEquipments();
  }

  // ==================== TYPE FILTER (PILLS) ====================

  onTypeFilterChange(filter: 'all' | 'cabinet' | 'panel'): void {
    this.store.setTypeFilter(filter);
  }

  isTypeFilterActive(filter: 'all' | 'cabinet' | 'panel'): boolean {
    return this.store.filters().typeFilter === filter;
  }

  // ==================== FILTERS ====================

  onOpenFilters(): void {
    this.showFiltersAside.set(true);
  }

  onCloseFilters(): void {
    this.showFiltersAside.set(false);
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.setSearchQuery('');
  }

  // ==================== PAGINATION ====================

  onPageSizeChange(value: string): void {
    const pageSize = parseInt(value, 10);
    this.store.setPageSize(pageSize);
  }

  /**
   * Generar números de página con ellipsis (...)
   * Ejemplo: [1, 2, 3, ..., 10] o [1, ..., 5, 6, 7, ..., 10]
   */
  getPageNumbers(): (number | string)[] {
    const info = this.store.paginationInfo();
    const total = info.totalPages;
    const current = info.currentPage;

    if (total <= 7) {
      // Mostrar todos los números si hay 7 o menos páginas
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Siempre mostrar: primera, última, actual, y 2 a cada lado de la actual
    const pages: (number | string)[] = [];

    // Primera página
    pages.push(1);

    // Ellipsis izquierda
    if (current > 3) {
      pages.push('...');
    }

    // Páginas alrededor de la actual
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    // Ellipsis derecha
    if (current < total - 2) {
      pages.push('...');
    }

    // Última página
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  }

  // ==================== ACTIONS ====================

  onCreateNew(): void {
    this.router.navigate(['/equipments/new']).then();
  }

  onViewEquipment(equipment: EquipmentEntity): void {
    const type = equipment.type === EquipmentTypeEnum.CABINET ? 'cabinet' : 'panel';
    this.router.navigate(['/equipments', type, equipment.id]).then();
  }

  onEditEquipment(equipment: EquipmentEntity): void {
    const type = equipment.type === EquipmentTypeEnum.CABINET ? 'cabinet' : 'panel';
    this.router.navigate(['/equipments', type, equipment.id, 'edit']).then();
  }

  onDeleteClick(equipment: EquipmentEntity): void {
    this.equipmentToDelete.set(equipment);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const equipment = this.equipmentToDelete();
    if (!equipment) return;

    this.isDeleting.set(true);

    const success = await this.store.deleteEquipment(equipment);

    if (success) {
      this.closeDeleteModal();
    }

    this.isDeleting.set(false);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.equipmentToDelete.set(null);
    this.isDeleting.set(false);
  }

  onRefresh(): void {
    this.store.loadEquipments();
  }

  // ==================== HELPERS ====================

  getEquipmentTypeLabel = getEquipmentTypeLabel;
  getEquipmentStatusLabel = getEquipmentStatusLabel;

  getDeleteModalMessage(equipment: EquipmentEntity): string {
    const typeLabel = getEquipmentTypeLabel(equipment.type);
    return `${typeLabel}: ${equipment.tag}`;
  }
}

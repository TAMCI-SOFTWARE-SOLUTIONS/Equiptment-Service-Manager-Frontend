import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { Drawer } from 'primeng/drawer';
import {PowerDistributionPanelsStore} from '../../model/power-distribution-panels.store';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {
  PowerDistributionPanelTypeEnum
} from '../../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {PrimeTemplate} from 'primeng/api';

@Component({
  selector: 'app-power-distribution-panels',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, Drawer, PrimeTemplate],
  templateUrl: './power-distribution-panels.page.html'
})
export class PowerDistributionPanelsPage implements OnInit {
  readonly store = inject(PowerDistributionPanelsStore);
  private readonly router = inject(Router);

  // UI state
  readonly showDeleteModal = signal(false);
  readonly panelToDelete = signal<PowerDistributionPanelEntity | null>(null);
  readonly showFiltersDrawer = signal(false);

  // Enum para template
  readonly PanelTypeEnum = PowerDistributionPanelTypeEnum;

  ngOnInit(): void {
    this.store.loadPanels();
  }

  /**
   * Obtener nombre descriptivo del tipo
   */
  getTypeName(type: PowerDistributionPanelTypeEnum): string {
    const typeNames: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'Tablero de Distribución de Instrumentación',
      [PowerDistributionPanelTypeEnum.DPU]: 'Tablero de Distribución de UPS'
    };
    return typeNames[type] || type;
  }

  /**
   * Obtener label corto del tipo
   */
  getTypeLabel(type: PowerDistributionPanelTypeEnum): string {
    return type; // PDJ o DPU
  }

  /**
   * Obtener color del badge según tipo
   */
  getTypeBadgeClass(type: PowerDistributionPanelTypeEnum): string {
    const classes: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'bg-sky-100 text-sky-700',
      [PowerDistributionPanelTypeEnum.DPU]: 'bg-cyan-100 text-cyan-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

  onTypeFilterChange(type: PowerDistributionPanelTypeEnum | 'ALL'): void {
    this.store.setTypeFilter(type);
  }

  clearFilters(): void {
    this.store.clearFilters();
    this.showFiltersDrawer.set(false);
  }

  onRefresh(): void {
    this.store.loadPanels();
  }

  onEdit(panel: PowerDistributionPanelEntity): void {
    this.router.navigate(['/power-distribution-panels', panel.id, 'edit']).then(() => {});
  }

  onDeleteClick(panel: PowerDistributionPanelEntity): void {
    this.panelToDelete.set(panel);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const panel = this.panelToDelete();
    if (!panel) return;

    await this.store.removePanel(panel.id);
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.panelToDelete.set(null);
  }

  onCreateNew(): void {
    this.router.navigate(['/power-distribution-panels/new']).then(() => {});
  }

  toggleFiltersDrawer(): void {
    this.showFiltersDrawer.set(!this.showFiltersDrawer());
  }
}

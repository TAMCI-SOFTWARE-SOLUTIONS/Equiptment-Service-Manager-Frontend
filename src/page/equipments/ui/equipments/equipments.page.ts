import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentsStore } from '../../model/equipments.store';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { Ripple } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipments',
  imports: [CommonModule, Ripple, FormsModule],
  standalone: true,
  templateUrl: './equipments.page.html'
})
export class EquipmentsPage implements OnInit, OnDestroy {
  readonly store = inject(EquipmentsStore);
  private readonly router = inject(Router);

  // UI state - SOLO estado de UI
  readonly searchQuery = signal('');

  // Computed - Equipos filtrados
  readonly filteredEquipments = computed(() => {
    return this.store.filteredEquipments();
  });

  ngOnInit(): void {
    this.loadEquipments();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  loadEquipments(): void {
    this.store.loadAllData();
  }

  onEquipmentSelect(equipmentId: string): void {
    this.store.selectEquipment(equipmentId);
    this.router.navigate(['/equipments', equipmentId]).then(() => {});
  }

  onCreateEquipment(): void {
    this.router.navigate(['/equipments/new']).then(() => {});
  }

  onEditEquipment(equipmentId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/equipments', equipmentId, 'edit']).then(() => {});
  }

  onRefresh(): void {
    this.searchQuery.set('');
    this.store.clearFilters();
    this.store.loadAllData();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.store.setSearchQuery('');
  }

  onEquipmentTypeFilterChange(equipmentType: EquipmentTypeEnum | null): void {
    this.store.setEquipmentTypeFilter(equipmentType);
  }

  clearEquipmentTypeFilter(): void {
    this.store.setEquipmentTypeFilter(null);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEquipmentTypeIcon(type: EquipmentTypeEnum): string {
    switch (type) {
      case EquipmentTypeEnum.CABINET:
        return 'pi-box';
      case EquipmentTypeEnum.PANEL:
        return 'pi-desktop';
      default:
        return 'pi-cog';
    }
  }
}

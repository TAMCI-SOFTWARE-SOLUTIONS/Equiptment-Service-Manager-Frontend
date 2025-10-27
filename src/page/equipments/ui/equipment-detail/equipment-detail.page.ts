import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { EquipmentDetailStore } from '../../model/equipment-detail.store';
import { EquipmentPowerAssignmentsStore } from '../../model/equipment-power-assignments.store';
import {
  EquipmentTypeEnum,
  getEquipmentTypeEmoji,
  getEquipmentTypeLabel
} from '../../../../entities/equipment/model/equipment-type.enum';
import {
  getEquipmentStatusColor,
  getEquipmentStatusLabel
} from '../../../../entities/equipment/model/equipment-status.enum';
import {PowerAssignmentDrawerComponent} from '../power-assignment-drawer/power-assignment-drawer.component';
import {
  PowerDistributionPanelTypeEnum
} from '../../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {EquipmentInspectableItemsStore} from '../../model/equipment-inspectable-items.store';
import {InspectableItemDrawerComponent} from '../inspectable-item-drawer/inspectable-item-drawer.component';
import {InspectableItemCardComponent} from '../inspectable-item-card/inspectable-item-card.component';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    PowerAssignmentDrawerComponent,
    InspectableItemDrawerComponent,
    InspectableItemCardComponent,
    Ripple
  ],
  providers: [
    EquipmentDetailStore,
    EquipmentPowerAssignmentsStore,
    EquipmentInspectableItemsStore
  ],
  templateUrl: './equipment-detail.page.html'
})
export class EquipmentDetailPage implements OnInit, OnDestroy {
  readonly store = inject(EquipmentDetailStore);
  readonly powerStore = inject(EquipmentPowerAssignmentsStore);
  readonly itemsStore = inject(EquipmentInspectableItemsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly showDeletePowerModal = signal(false);
  readonly showDeleteItemModal = signal(false);
  readonly powerAssignmentToDelete = signal<string | null>(null);
  readonly itemToDelete = signal<string | null>(null);

  // Expose enums and helpers to the template
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly PowerDistributionPanelTypeEnum = PowerDistributionPanelTypeEnum;

  ngOnInit(): void {
    const equipmentId = this.route.snapshot.paramMap.get('id');
    const urlPath = this.route.snapshot.url.map(segment => segment.path);
    let type: EquipmentTypeEnum;

    if (urlPath.includes('panel')) {
      type = EquipmentTypeEnum.PANEL;
    } else if (urlPath.includes('cabinet')) {
      type = EquipmentTypeEnum.CABINET;
    } else {
      this.router.navigate(['/equipments']).then();
      return;
    }

    if (equipmentId) {
      this.store.loadEquipment(equipmentId, type);
      this.powerStore.loadAssignments(equipmentId);
      this.itemsStore.initialize(equipmentId, type);
    } else {
      this.router.navigate(['/equipments']).then();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
    this.powerStore.reset();
    this.itemsStore.reset();
  }

  // ==================== EQUIPMENT ACTIONS ====================

  onBack(): void {
    this.router.navigate(['/equipments']).then();
  }

  onEdit(): void {
    const equipment = this.store.equipment();
    if (!equipment) return;

    const type = equipment.type === EquipmentTypeEnum.CABINET ? 'cabinet' : 'panel';
    this.router.navigate(['/equipments', type, equipment.id, 'edit']).then();
  }

  onDeleteClick(): void {
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const success = await this.store.deleteEquipment();

    if (success) {
      this.closeDeleteModal();
      this.router.navigate(['/equipments']).then();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  onRefresh(): void {
    const equipment = this.store.equipment();
    if (!equipment) return;

    this.store.loadEquipment(equipment.id, equipment.type);
    this.powerStore.loadAssignments(equipment.id);
    this.itemsStore.initialize(equipment.id, equipment.type);
  }

  // ==================== POWER ASSIGNMENT ACTIONS ====================

  onAddPowerAssignment(): void {
    this.powerStore.openDrawerForCreate();
  }

  onEditPowerAssignment(assignmentId: string): void {
    this.powerStore.openDrawerForEdit(assignmentId);
  }

  onDeletePowerClick(assignmentId: string): void {
    this.powerAssignmentToDelete.set(assignmentId);
    this.showDeletePowerModal.set(true);
  }

  async confirmDeletePower(): Promise<void> {
    const assignmentId = this.powerAssignmentToDelete();
    if (!assignmentId) return;

    const success = await this.powerStore.deleteAssignment(assignmentId);

    if (success) {
      this.closeDeletePowerModal();
    }
  }

  closeDeletePowerModal(): void {
    this.showDeletePowerModal.set(false);
    this.powerAssignmentToDelete.set(null);
  }

  onPowerAssignmentSuccess(): void {
    // El store ya recarga automáticamente después de crear
    console.log('✅ Power assignment saved successfully');
  }

  // ==================== HELPERS ====================

  getEquipmentTypeEmoji = getEquipmentTypeEmoji;
  getEquipmentStatusLabel = getEquipmentStatusLabel;
  getEquipmentStatusColor = getEquipmentStatusColor;

  getDeleteModalMessage(): string {
    const equipment = this.store.equipment();
    if (!equipment) return '';

    const typeLabel = getEquipmentTypeLabel(equipment.type);
    return `${typeLabel}: ${equipment.tag}`;
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Sin registro';

    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeSince(date: Date | null): string {
    if (!date) return '';

    const now = new Date();
    const dateObj = new Date(date);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }

  getPanelTypeBadgeClass(type: PowerDistributionPanelTypeEnum): string {
    const classes: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'bg-sky-100 text-sky-700',
      [PowerDistributionPanelTypeEnum.DPU]: 'bg-cyan-100 text-cyan-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }

  getPanelTypeDescription(type: PowerDistributionPanelTypeEnum): string {
    const descriptions: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'Tablero de Distribución de Instrumentación',
      [PowerDistributionPanelTypeEnum.DPU]: 'Tablero de Distribución de UPS'
    };
    return descriptions[type] || type;
  }

  getCircuitsText(circuits: number[]): string {
    if (circuits.length === 0) return 'Sin circuitos';
    if (circuits.length === 30) return 'Todos (1-30)';

    const sorted = [...circuits].sort((a, b) => a - b);

    // Agrupar en rangos
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== prev + 1) {
        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }
        start = sorted[i];
      }
      prev = sorted[i];
    }

    if (start === prev) {
      ranges.push(`${start}`);
    } else {
      ranges.push(`${start}-${prev}`);
    }

    return ranges.join(', ');
  }

  // ==================== INSPECTABLE ITEMS ACTIONS ====================

  onAddInspectableItem(): void {
    this.itemsStore.openDrawerForCreate();
  }

  onEditInspectableItem(itemId: string): void {
    this.itemsStore.openDrawerForEdit(itemId);
  }

  onDeleteItemClick(itemId: string): void {
    this.itemToDelete.set(itemId);
    this.showDeleteItemModal.set(true);
  }

  async confirmDeleteItem(): Promise<void> {
    const itemId = this.itemToDelete();
    if (!itemId) return;

    const success = await this.itemsStore.deleteItem(itemId);

    if (success) {
      this.closeDeleteItemModal();
    }
  }

  closeDeleteItemModal(): void {
    this.showDeleteItemModal.set(false);
    this.itemToDelete.set(null);
  }

  onInspectableItemSuccess(): void {
    console.log('✅ Inspectable item saved successfully');
  }

  onToggleItemType(type: any): void {
    this.itemsStore.toggleType(type);
  }

  onSearchItemsChange(value: string): void {
    this.itemsStore.setSearchQuery(value);
  }

  clearItemsSearch(): void {
    this.itemsStore.clearSearch();
  }

  onFilterTypeChange(type: any): void {
    this.itemsStore.setFilterType(type);
  }

  getItemTypeConfig(type: any) {
    return this.itemsStore.getTypeConfig()(type);
  }
}

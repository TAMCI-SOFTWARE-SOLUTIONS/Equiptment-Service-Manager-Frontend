import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EquipmentsStore} from '../../model/equipments.store';
import {EquipmentStatusEnum, getEquipmentStatusLabel} from '../../../../entities/equipment/model/equipment-status.enum';
import {Ripple} from 'primeng/ripple';
import {Drawer} from 'primeng/drawer';

// 🆕 Interface para filtros locales (draft mode)
interface LocalFilters {
  typeFilter: 'all' | 'cabinet' | 'panel';
  equipmentTypeId: string | null;
  plantId: string | null;
  areaId: string | null;
  locationId: string | null;
  statusFilter: EquipmentStatusEnum | null;
  communicationProtocolId: string | null;

  // Date ranges (local strings)
  createdAtFrom: string;
  createdAtTo: string;
  updatedAtFrom: string;
  updatedAtTo: string;
  lastInspectionFrom: string;
  lastInspectionTo: string;
  lastMaintenanceFrom: string;
  lastMaintenanceTo: string;
  lastObservationsFrom: string;
  lastObservationsTo: string;
}

@Component({
  selector: 'app-equipment-filters-aside',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, Drawer],
  templateUrl: './equipment-filters-aside.component.html',
})
export class EquipmentFiltersAsideComponent {
  readonly store = inject(EquipmentsStore);

  @Input() show = false;
  @Output() onClose = new EventEmitter<void>();

  // Expose enum to template
  readonly EquipmentStatusEnum = EquipmentStatusEnum;

  // 🆕 Local draft filters (no se aplican hasta dar "Aplicar")
  localFilters: LocalFilters = this.initializeLocalFilters();

  // Accordion state
  showLocationFilters = true;
  showDateFilters = false;

  ngOnChanges(): void {
    if (this.show) {
      // Cargar filtros actuales del store al abrir
      this.loadFiltersFromStore();
    }
  }

  private initializeLocalFilters(): LocalFilters {
    return {
      typeFilter: 'all',
      equipmentTypeId: null,
      plantId: null,
      areaId: null,
      locationId: null,
      statusFilter: null,
      communicationProtocolId: null,
      createdAtFrom: '',
      createdAtTo: '',
      updatedAtFrom: '',
      updatedAtTo: '',
      lastInspectionFrom: '',
      lastInspectionTo: '',
      lastMaintenanceFrom: '',
      lastMaintenanceTo: '',
      lastObservationsFrom: '',
      lastObservationsTo: ''
    };
  }

  private loadFiltersFromStore(): void {
    const storeFilters = this.store.filters();

    this.localFilters = {
      typeFilter: storeFilters.typeFilter,
      equipmentTypeId: storeFilters.equipmentTypeId,
      plantId: storeFilters.plantId,
      areaId: storeFilters.areaId,
      locationId: storeFilters.locationId,
      statusFilter: storeFilters.statusFilter,
      communicationProtocolId: storeFilters.communicationProtocolId,

      createdAtFrom: storeFilters.createdAtRange.from ? this.dateToString(storeFilters.createdAtRange.from) : '',
      createdAtTo: storeFilters.createdAtRange.to ? this.dateToString(storeFilters.createdAtRange.to) : '',

      updatedAtFrom: storeFilters.updatedAtRange.from ? this.dateToString(storeFilters.updatedAtRange.from) : '',
      updatedAtTo: storeFilters.updatedAtRange.to ? this.dateToString(storeFilters.updatedAtRange.to) : '',

      lastInspectionFrom: storeFilters.lastInspectionAtRange.from ? this.dateToString(storeFilters.lastInspectionAtRange.from) : '',
      lastInspectionTo: storeFilters.lastInspectionAtRange.to ? this.dateToString(storeFilters.lastInspectionAtRange.to) : '',

      lastMaintenanceFrom: storeFilters.lastMaintenanceAtRange.from ? this.dateToString(storeFilters.lastMaintenanceAtRange.from) : '',
      lastMaintenanceTo: storeFilters.lastMaintenanceAtRange.to ? this.dateToString(storeFilters.lastMaintenanceAtRange.to) : '',

      lastObservationsFrom: storeFilters.lastRaiseObservationsAtRange.from ? this.dateToString(storeFilters.lastRaiseObservationsAtRange.from) : '',
      lastObservationsTo: storeFilters.lastRaiseObservationsAtRange.to ? this.dateToString(storeFilters.lastRaiseObservationsAtRange.to) : ''
    };
  }

  private dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private stringToDate(str: string): Date | null {
    return str ? new Date(str) : null;
  }

  // ==================== LOCAL FILTER HANDLERS (NO APLICAN TODAVÍA) ====================

  onTypeFilterChange(value: 'all' | 'cabinet' | 'panel'): void {
    this.localFilters.typeFilter = value;
    // Reset equipmentTypeId cuando cambia el tipo
    if (value === 'all') {
      this.localFilters.equipmentTypeId = null;
    }
  }

  onEquipmentTypeChange(value: string): void {
    this.localFilters.equipmentTypeId = value || null;
  }

  onPlantChange(value: string): void {
    this.localFilters.plantId = value || null;
    // Reset dependientes
    this.localFilters.areaId = null;
    this.localFilters.locationId = null;
  }

  onAreaChange(value: string): void {
    this.localFilters.areaId = value || null;
    // Reset dependiente
    this.localFilters.locationId = null;
  }

  onLocationChange(value: string): void {
    this.localFilters.locationId = value || null;
  }

  onStatusChange(value: string): void {
    this.localFilters.statusFilter = value as EquipmentStatusEnum || null;
  }

  onProtocolChange(value: string): void {
    this.localFilters.communicationProtocolId = value || null;
  }

  // ==================== ACTIONS ====================

  onClearFilters(): void {
    this.localFilters = this.initializeLocalFilters();
  }

  onApplyFilters(): void {
    // 🆕 AQUÍ SE APLICAN LOS FILTROS AL STORE
    console.log('🚀 Applying filters:', this.localFilters);

    // Basic filters
    this.store.setTypeFilter(this.localFilters.typeFilter);
    this.store.setEquipmentTypeFilter(this.localFilters.equipmentTypeId);
    this.store.setPlantFilter(this.localFilters.plantId);
    this.store.setAreaFilter(this.localFilters.areaId);
    this.store.setLocationFilter(this.localFilters.locationId);
    this.store.setStatusFilter(this.localFilters.statusFilter);
    this.store.setProtocolFilter(this.localFilters.communicationProtocolId);

    // Date ranges
    this.store.setCreatedAtRange({
      from: this.stringToDate(this.localFilters.createdAtFrom),
      to: this.stringToDate(this.localFilters.createdAtTo)
    });

    this.store.setUpdatedAtRange({
      from: this.stringToDate(this.localFilters.updatedAtFrom),
      to: this.stringToDate(this.localFilters.updatedAtTo)
    });

    this.store.setLastInspectionAtRange({
      from: this.stringToDate(this.localFilters.lastInspectionFrom),
      to: this.stringToDate(this.localFilters.lastInspectionTo)
    });

    this.store.setLastMaintenanceAtRange({
      from: this.stringToDate(this.localFilters.lastMaintenanceFrom),
      to: this.stringToDate(this.localFilters.lastMaintenanceTo)
    });

    this.store.setLastRaiseObservationsAtRange({
      from: this.stringToDate(this.localFilters.lastObservationsFrom),
      to: this.stringToDate(this.localFilters.lastObservationsTo)
    });

    this.store.clearSearchQuery();

    // Cerrar drawer
    this.onClose.emit();
  }

  toggleLocationFilters(): void {
    this.showLocationFilters = !this.showLocationFilters;
  }

  toggleDateFilters(): void {
    this.showDateFilters = !this.showDateFilters;
  }

  // ==================== HELPERS ====================

  getEquipmentStatusLabel = getEquipmentStatusLabel;

  get isEquipmentTypeDisabled(): boolean {
    return this.localFilters.typeFilter === 'all';
  }

  get equipmentTypeLabel(): string {
    if (this.localFilters.typeFilter === 'cabinet') return 'Tipo de Gabinete';
    if (this.localFilters.typeFilter === 'panel') return 'Tipo de Panel';
    return 'Tipo de Equipo';
  }

  // 🆕 Computed para tipos de equipos según el tipo local
  get uniqueEquipmentTypes() {
    const equipments = this.store.equipments();
    const typeFilter = this.localFilters.typeFilter;

    if (typeFilter === 'all') return [];

    const filtered = equipments.filter(e => {
      if (typeFilter === 'cabinet') return e.type === 'CABINET';
      if (typeFilter === 'panel') return e.type === 'PANEL';
      return false;
    });

    const uniqueTypes = new Map<string, string>();

    filtered.forEach(equipment => {
      // 🔍 DEBUG
      if (equipment.equipmentTypeId && equipment.equipmentTypeCode) {
        uniqueTypes.set(equipment.equipmentTypeId, equipment.equipmentTypeCode);
      }
    });

    const result = Array.from(uniqueTypes.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log('🔍 Unique Equipment Types:', result);
    return result;
  }

  // 🆕 Computed para protocolos
  get uniqueProtocols() {
    const equipments = this.store.equipments();
    const protocols = new Map<string, string>();

    equipments.forEach(equipment => {
      if (equipment.communicationProtocolId && equipment.communicationProtocol) {
        protocols.set(equipment.communicationProtocolId, equipment.communicationProtocol);
      }
    });

    return Array.from(protocols.entries())
      .map(([id, name]) => ({id, name}))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get hasLocalDateFilters(): boolean {
    return !!(
      this.localFilters.createdAtFrom ||
      this.localFilters.createdAtTo ||
      this.localFilters.updatedAtFrom ||
      this.localFilters.updatedAtTo ||
      this.localFilters.lastInspectionFrom ||
      this.localFilters.lastInspectionTo ||
      this.localFilters.lastMaintenanceFrom ||
      this.localFilters.lastMaintenanceTo ||
      this.localFilters.lastObservationsFrom ||
      this.localFilters.lastObservationsTo
    );
  }

  get hasLocalLocationFilters(): boolean {
    return !!(
      this.localFilters.plantId ||
      this.localFilters.areaId ||
      this.localFilters.locationId ||
      this.localFilters.communicationProtocolId ||
      this.localFilters.statusFilter
    );
  }

  get hasAnyLocalFilters(): boolean {
    return this.localFilters.typeFilter !== 'all' ||
      !!this.localFilters.equipmentTypeId ||
      this.hasLocalLocationFilters ||
      this.hasLocalDateFilters;
  }
}

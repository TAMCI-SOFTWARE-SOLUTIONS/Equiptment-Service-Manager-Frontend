import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { Ripple } from 'primeng/ripple';
import { ProjectStatusEnum } from '../../../../entities/project/model/project-status.enum';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { ClientEntity } from '../../../../entities/client/model';
import {PrimeTemplate} from 'primeng/api';

interface StatusOption {
  label: string;
  value: ProjectStatusEnum;
}

interface EquipmentTypeOption {
  label: string;
  value: EquipmentTypeEnum;
  icon: string;
}

interface ClientOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer, Select, Ripple, PrimeTemplate],
  templateUrl: './filter-drawer.component.html'
})
export class FilterDrawerComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly selectedStatus = input<ProjectStatusEnum | null>(null);
  readonly selectedClientId = input<string | null>(null);
  readonly selectedEquipmentType = input<EquipmentTypeEnum | null>(null);
  readonly clients = input<ClientEntity[]>([]);
  readonly isLoadingClients = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly statusChange = output<ProjectStatusEnum | null>();
  readonly clientChange = output<string | null>();
  readonly equipmentTypeChange = output<EquipmentTypeEnum | null>();
  readonly clearFilters = output<void>();
  readonly applyFilters = output<void>();

  // Local state (para el formulario)
  localStatus: ProjectStatusEnum | null = null;
  localClientId: string | null = null;
  localEquipmentType: EquipmentTypeEnum | null = null;

  // Opciones
  readonly statusOptions: StatusOption[] = [
    { label: 'Planificado', value: ProjectStatusEnum.PLANNED },
    { label: 'En Progreso', value: ProjectStatusEnum.IN_PROGRESS },
    { label: 'Completado', value: ProjectStatusEnum.COMPLETED },
    { label: 'En Espera', value: ProjectStatusEnum.ON_HOLD },
    { label: 'Cancelado', value: ProjectStatusEnum.CANCELLED }
  ];

  readonly equipmentTypeOptions: EquipmentTypeOption[] = [
    { label: 'Gabinetes', value: EquipmentTypeEnum.CABINET, icon: '📦' },
    { label: 'Paneles', value: EquipmentTypeEnum.PANEL, icon: '📋' }
  ];

  constructor() {
    // Sincronizar valores cuando cambien los inputs
    effect(() => {
      this.localStatus = this.selectedStatus();
      this.localClientId = this.selectedClientId();
      this.localEquipmentType = this.selectedEquipmentType();
    });
  }

  get clientOptions(): ClientOption[] {
    return this.clients().map(client => ({
      label: client.name,
      value: client.id
    }));
  }

  get hasActiveFilters(): boolean {
    return this.localStatus !== null ||
      this.localClientId !== null ||
      this.localEquipmentType !== null;
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.localStatus !== null) count++;
    if (this.localClientId !== null) count++;
    if (this.localEquipmentType !== null) count++;
    return count;
  }

  onClose(): void {
    this.visibleChange.emit(false);
  }

  onClearFilters(): void {
    this.localStatus = null;
    this.localClientId = null;
    this.localEquipmentType = null;
    this.clearFilters.emit();
  }

  onApplyFilters(): void {
    this.statusChange.emit(this.localStatus);
    this.clientChange.emit(this.localClientId);
    this.equipmentTypeChange.emit(this.localEquipmentType);
    this.applyFilters.emit();
    this.onClose();
  }
}

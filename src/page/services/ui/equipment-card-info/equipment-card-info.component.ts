import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabinetEntity } from '../../../../entities/cabinet/model';
import { PanelEntity } from '../../../../entities/panel/model';
import { EquipmentTypeEnum } from '../../../../shared/model';

@Component({
  selector: 'app-equipment-info-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">

      <!-- Header -->
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100">
          <i [class]="getEquipmentIcon()" class="text-xl text-cyan-600"></i>
        </div>
        <h2 class="text-lg font-semibold text-gray-900">
          Información del Equipo
        </h2>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-4 md:grid-cols-2">

        <!-- Tipo -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Tipo
          </label>
          <p class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <i [class]="getEquipmentIcon()" class="text-cyan-600"></i>
            {{ getEquipmentTypeLabel() }}
          </p>
        </div>

        <!-- Tag -->
        <div class="rounded-lg bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-sky-700">
            Tag del Equipo
          </label>
          <p class="font-mono text-lg font-bold text-sky-900">
            {{ equipment.tag }}
          </p>
        </div>

        <!-- Tipo Específico (Cabinet Type o Panel Type) -->
        @if (isCabinet()) {
          <div class="rounded-lg bg-gray-50 p-4">
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Tipo de Gabinete
            </label>
            <p class="text-base font-medium text-gray-900">
              {{ getCabinetType() }}
            </p>
          </div>
        } @else {
          <div class="rounded-lg bg-gray-50 p-4">
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Tipo de Panel
            </label>
            <p class="text-base font-medium text-gray-900">
              {{ getPanelType() }}
            </p>
          </div>
        }

        <!-- Protocolo de Comunicación -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Protocolo
          </label>
          <p class="flex items-center gap-2 text-base font-medium text-gray-900">
            <i class="pi pi-wifi text-gray-600"></i>
            {{ equipment.communicationProtocol || 'N/A' }}
          </p>
        </div>

        <!-- Estado -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Estado
          </label>
          <div class="mt-1">
            <span [class]="getEquipmentStatusBadgeClass()">
              {{ getEquipmentStatusLabel() }}
            </span>
          </div>
        </div>

        <!-- Ubicación de Referencia (si existe) -->
        @if (equipment.referenceLocation) {
          <div class="rounded-lg bg-gray-50 p-4">
            <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Ubicación de Referencia
            </label>
            <p class="text-sm text-gray-900">
              {{ equipment.referenceLocation }}
            </p>
          </div>
        }

      </div>

    </div>
  `
})
export class EquipmentInfoCardComponent {
  @Input({ required: true }) equipment!: CabinetEntity | PanelEntity;
  @Input({ required: true }) equipmentType!: EquipmentTypeEnum;

  isCabinet(): boolean {
    return this.equipmentType === EquipmentTypeEnum.CABINET;
  }

  getEquipmentTypeLabel(): string {
    return this.equipmentType === EquipmentTypeEnum.CABINET ? 'Gabinete' : 'Panel';
  }

  getEquipmentIcon(): string {
    return this.equipmentType === EquipmentTypeEnum.CABINET ? 'pi pi-clone' : 'pi pi-th-large';
  }

  getCabinetType(): string {
    if (this.isCabinet()) {
      return (this.equipment as CabinetEntity).cabinetType || 'N/A';
    }
    return 'N/A';
  }

  getPanelType(): string {
    if (!this.isCabinet()) {
      return (this.equipment as PanelEntity).panelType || 'N/A';
    }
    return 'N/A';
  }

  getEquipmentStatusLabel(): string {
    const status = this.equipment.status;
    const labels: Record<string, string> = {
      'OPERATIVE': 'Operativo',
      'STAND_BY': 'En Espera',
      'INOPERATIVE': 'Inoperativo',
      'RETIRED': 'Retirado'
    };
    return labels[status] || status;
  }

  getEquipmentStatusBadgeClass(): string {
    const status = this.equipment.status;
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium';

    const statusClasses: Record<string, string> = {
      'OPERATIVE': 'bg-green-100 text-green-700',
      'STAND_BY': 'bg-yellow-100 text-yellow-700',
      'INOPERATIVE': 'bg-rose-100 text-rose-700',
      'RETIRED': 'bg-gray-100 text-gray-700'
    };

    return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`;
  }
}

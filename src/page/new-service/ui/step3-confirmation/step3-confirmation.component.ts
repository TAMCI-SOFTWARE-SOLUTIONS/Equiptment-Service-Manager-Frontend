import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { getEquipmentStatusLabel, getEquipmentStatusColor } from '../../../../entities/equipment/model/equipment-status.enum';
import { EquipmentStatusEnum } from '../../../../entities/equipment/model/equipment-status.enum';
import { CreateServiceStore } from '../../model/store/create-service.store';
import {
  PowerDistributionPanelTypeEnum
} from '../../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-step3-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select
  ],
  templateUrl: './step3-confirmation.component.html'
})
export class Step3ConfirmationComponent implements OnInit {
  readonly store = inject(CreateServiceStore);

  // Expose enums
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly PowerDistributionPanelTypeEnum = PowerDistributionPanelTypeEnum;

  ngOnInit(): void {
    // Cargar supervisores al iniciar Step 3
    if (this.store.supervisors().length === 0) {
      this.store.loadSupervisors();
    }
  }

  // ==================== SUPERVISOR ====================

  onSupervisorChange(supervisorId: string | null): void {
    this.store.setSupervisorId(supervisorId);
  }

  getSupervisorOptions() {
    return this.store.supervisors().map(supervisor => ({
      label: supervisor.fullName,
      value: supervisor.id
    }));
  }

  // ==================== EQUIPMENT STATUS ====================

  getStatusLabel(status: any): string {
    if (!status) return 'Desconocido';
    return getEquipmentStatusLabel(status as EquipmentStatusEnum);
  }

  getStatusClasses(status: any): string {
    if (!status) return 'bg-gray-100 text-gray-700 border border-gray-200';

    const colors = getEquipmentStatusColor(status as EquipmentStatusEnum);
    return `${colors.bg} ${colors.text} ${colors.border} border`;
  }

  getStatusIndicatorClass(status: any): string {
    if (!status) return 'bg-gray-500';

    const colors = getEquipmentStatusColor(status as EquipmentStatusEnum);
    return colors.indicator;
  }

  getEquipmentTypeName(): string {
    const equipment = this.store.selectedEquipment();
    const equipmentType = this.store.formData().selectedEquipmentType;

    if (!equipment) return 'No especificado';

    if (equipmentType === EquipmentTypeEnum.CABINET) {
      return (equipment as any).cabinetType || 'No especificado';
    } else {
      return (equipment as any).panelType || 'No especificado';
    }
  }

  // ==================== PANEL TYPE ====================

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

  // ==================== CIRCUITS ====================

  getCircuitsText(circuits: number[]): string {
    if (!circuits || circuits.length === 0) return 'Sin circuitos';
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
}

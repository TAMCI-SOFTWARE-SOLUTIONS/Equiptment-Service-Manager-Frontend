import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { EquipmentPowerAssignmentsStore } from '../../model/equipment-power-assignments.store';
import {
  PowerDistributionPanelTypeEnum
} from '../../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {PrimeTemplate} from 'primeng/api';

@Component({
  selector: 'app-power-assignment-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer, Ripple, Select, PrimeTemplate],
  templateUrl: './power-assignment-drawer.component.html'
})
export class PowerAssignmentDrawerComponent {
  readonly store = inject(EquipmentPowerAssignmentsStore);

  @Output() onSuccess = new EventEmitter<void>();

  // Circuitos disponibles (1-30)
  readonly availableCircuits = Array.from({ length: 30 }, (_, i) => i + 1);

  /**
   * Obtener clase de badge según tipo de panel
   */
  getPanelTypeBadgeClass(type: PowerDistributionPanelTypeEnum): string {
    const classes: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'bg-sky-100 text-sky-700',
      [PowerDistributionPanelTypeEnum.DPU]: 'bg-cyan-100 text-cyan-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Obtener descripción del tipo de panel
   */
  getPanelTypeDescription(type: PowerDistributionPanelTypeEnum): string {
    const descriptions: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'Tablero de Distribución de Instrumentación',
      [PowerDistributionPanelTypeEnum.DPU]: 'Tablero de Distribución de UPS'
    };
    return descriptions[type] || type;
  }

  onPanelChange(panelId: string | null): void {
    this.store.selectPanel(panelId);
  }

  onCircuitToggle(circuitNumber: number): void {
    this.store.toggleCircuit(circuitNumber);
  }

  onSelectAll(): void {
    this.store.selectAllCircuits();
  }

  onClearAll(): void {
    this.store.clearCircuits();
  }

  onClose(): void {
    this.store.closeDrawer();
  }

  async onSubmit(): Promise<void> {
    const success = await this.store.createAssignment();
    if (success) {
      this.onSuccess.emit();
    }
  }

  /**
   * Verificar si un circuito está seleccionado
   */
  isCircuitSelected(circuitNumber: number): boolean {
    return this.store.formData().selectedCircuits.has(circuitNumber);
  }

  /**
   * Obtener rango de circuitos como texto
   */
  getCircuitsRangeText(): string {
    const circuits = this.store.selectedCircuitsArray();
    if (circuits.length === 0) return 'Ninguno';
    if (circuits.length === 30) return 'Todos (1-30)';

    // Agrupar en rangos
    const ranges: string[] = [];
    let start = circuits[0];
    let prev = circuits[0];

    for (let i = 1; i < circuits.length; i++) {
      if (circuits[i] !== prev + 1) {
        // Fin de rango
        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }
        start = circuits[i];
      }
      prev = circuits[i];
    }

    // Último rango
    if (start === prev) {
      ranges.push(`${start}`);
    } else {
      ranges.push(`${start}-${prev}`);
    }

    return ranges.join(', ');
  }
}

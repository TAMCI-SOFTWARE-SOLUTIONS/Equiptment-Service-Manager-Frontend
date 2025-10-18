import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import {
  PowerDistributionPanelTypeEnum
} from '../../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {PowerDistributionPanelFormStore} from '../../model/power-distribution-panel-form.store';
import {PowerDistributionPanelsStore} from '../../model/power-distribution-panels.store';
import {PrimeTemplate} from 'primeng/api';

interface TypeOption {
  label: string;
  value: PowerDistributionPanelTypeEnum;
  description: string;
}

@Component({
  selector: 'app-power-distribution-panel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, Select, PrimeTemplate],
  providers: [PowerDistributionPanelFormStore],
  templateUrl: './power-distribution-panel-form.page.html'
})
export class PowerDistributionPanelFormPage implements OnInit, OnDestroy {
  readonly store = inject(PowerDistributionPanelFormStore);
  readonly panelsStore = inject(PowerDistributionPanelsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Opciones del select
  readonly typeOptions: TypeOption[] = [
    {
      label: 'PDJ',
      value: PowerDistributionPanelTypeEnum.DPJ,
      description: 'Tablero de Distribución de Instrumentación'
    },
    {
      label: 'DPU',
      value: PowerDistributionPanelTypeEnum.DPU,
      description: 'Tablero de Distribución de UPS'
    }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Modo edición
      this.store.initializeForEdit(id);
    } else {
      // Modo creación
      this.store.initializeForCreate();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  onCodeChange(value: string): void {
    this.store.setCode(value);
  }

  onTypeChange(value: PowerDistributionPanelTypeEnum | null): void {
    this.store.setType(value);
  }

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      // Actualizar el store global de paneles
      if (this.store.isEditing()) {
        this.panelsStore.updatePanel(result);
      } else {
        this.panelsStore.addPanel(result);
      }

      // Navegar de vuelta a la lista
      this.router.navigate(['/power-distribution-panels']).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/power-distribution-panels']).then(() => {});
  }

  /**
   * Obtener clase de badge según tipo
   */
  getTypeBadgeClass(type: PowerDistributionPanelTypeEnum | null): string {
    if (!type) return 'bg-gray-100 text-gray-700';

    const classes: Record<PowerDistributionPanelTypeEnum, string> = {
      [PowerDistributionPanelTypeEnum.DPJ]: 'bg-sky-100 text-sky-700',
      [PowerDistributionPanelTypeEnum.DPU]: 'bg-cyan-100 text-cyan-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }
}

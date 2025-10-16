import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentFormStore } from '../../model/equipment-form.store';
import { EquipmentsStore } from '../../model/equipments.store';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { CabinetStatusEnum } from '../../../../entities/cabinet/model';
import { PanelStatusEnum } from '../../../../entities/panel/model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipment-new',
  imports: [CommonModule, FormsModule],
  standalone: true,
  providers: [EquipmentFormStore],
  templateUrl: './equipment-new.page.html'
})
export class EquipmentNewPage implements OnInit, OnDestroy {
  readonly formStore = inject(EquipmentFormStore);
  readonly equipmentsStore = inject(EquipmentsStore);
  private readonly router = inject(Router);

  // Estado de UI
  readonly equipmentTypes = [
    { value: EquipmentTypeEnum.CABINET, label: 'Cabinet', icon: 'pi-box' },
    { value: EquipmentTypeEnum.PANEL, label: 'Panel', icon: 'pi-desktop' }
  ];

  readonly cabinetStatuses = Object.values(CabinetStatusEnum);
  readonly panelStatuses = Object.values(PanelStatusEnum);

  ngOnInit(): void {
    // Inicializar con el primer tipo de equipo
    this.formStore.setEquipmentType(EquipmentTypeEnum.CABINET);
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  onSubmit(): void {
    if (this.formStore.canSubmit()) {
      this.formStore.submitEquipment()
        .then((equipment) => {
          if (!equipment) return;

          // Agregar al store principal
          if ((equipment as any).cabinetType) {
            this.equipmentsStore.addCabinet(equipment as any);
          } else if ((equipment as any).panelType) {
            this.equipmentsStore.addPanel(equipment as any);
          }

          // Navegar de vuelta a la lista
          this.router.navigate(['/equipments']);
        })
        .catch((err) => {
          console.error('Error submitting equipment:', err);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/equipments']).then(() => {});
  }

  onEquipmentTypeChange(equipmentType: EquipmentTypeEnum): void {
    this.formStore.setEquipmentType(equipmentType);
  }

  getCurrentStatuses(): string[] {
    const selectedType = this.formStore.formData().selectedType;
    if (selectedType === EquipmentTypeEnum.CABINET) {
      return this.cabinetStatuses;
    } else if (selectedType === EquipmentTypeEnum.PANEL) {
      return this.panelStatuses;
    }
    return [];
  }

  getEquipmentTypeIcon(type: EquipmentTypeEnum): string {
    const equipmentType = this.equipmentTypes.find(et => et.value === type);
    return equipmentType?.icon || 'pi-cog';
  }

  getEquipmentTypeLabel(type: EquipmentTypeEnum): string {
    const equipmentType = this.equipmentTypes.find(et => et.value === type);
    return equipmentType?.label || 'Desconocido';
  }

  protected readonly EquipmentTypeEnum = EquipmentTypeEnum;
}

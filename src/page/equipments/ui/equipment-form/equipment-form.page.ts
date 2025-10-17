import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EquipmentFormStore} from '../../model/equipment-form.store';
import {EquipmentTypeEnum, getEquipmentTypeLabel} from '../../../../entities/equipment/model/equipment-type.enum';
import {EquipmentStatusEnum, getEquipmentStatusLabel} from '../../../../entities/equipment/model/equipment-status.enum';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    Ripple
  ],
  providers: [EquipmentFormStore],
  templateUrl: './equipment-form.page.html'
})
export class EquipmentFormPage implements OnInit, OnDestroy {
  readonly store = inject(EquipmentFormStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI State
  readonly showTypeChangeModal = signal(false);
  readonly pendingTypeChange = signal<EquipmentTypeEnum | null>(null);

  // Expose enums to template
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly EquipmentStatusEnum = EquipmentStatusEnum;

  ngOnInit(): void {
    const equipmentType = this.route.snapshot.paramMap.get('type'); // 'cabinet' or 'panel'
    const equipmentId = this.route.snapshot.paramMap.get('id');

    if (equipmentId && equipmentId !== 'new') {
      // Modo edición
      const type = equipmentType === 'panel'
        ? EquipmentTypeEnum.PANEL
        : EquipmentTypeEnum.CABINET;

      this.store.initializeForEdit(equipmentId, type);
    } else {
      // Modo creación
      const type = equipmentType === 'panel'
        ? EquipmentTypeEnum.PANEL
        : EquipmentTypeEnum.CABINET;

      this.store.initializeForCreate(type);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== TYPE CHANGE ====================

  onTypeChange(newType: EquipmentTypeEnum): void {
    // Si está en modo edición y cambió el tipo, mostrar advertencia
    if (this.store.isEditing() && this.store.formData().type !== newType) {
      this.pendingTypeChange.set(newType);
      this.showTypeChangeModal.set(true);
    } else {
      // Modo creación, cambiar directamente
      this.store.setType(newType);
    }
  }

  async confirmTypeChange(): Promise<void> {
    const newType = this.pendingTypeChange();
    if (newType) {
      await this.store.setType(newType);
      this.closeTypeChangeModal();
    }
  }

  closeTypeChangeModal(): void {
    this.showTypeChangeModal.set(false);
    this.pendingTypeChange.set(null);
  }

  // ==================== FORM HANDLERS ====================

  onTagChange(value: string): void {
    this.store.setTag(value);
  }

  async onClientChange(value: string): Promise<void> {
    await this.store.setClient(value);
  }

  async onPlantChange(value: string): Promise<void> {
    await this.store.setPlant(value);
  }

  async onAreaChange(value: string): Promise<void> {
    await this.store.setArea(value);
  }

  onLocationChange(value: string): void {
    this.store.setLocation(value);
  }

  onEquipmentTypeChange(value: string): void {
    this.store.setEquipmentType(value);
  }

  onCommunicationProtocolChange(value: string): void {
    this.store.setCommunicationProtocol(value || null);
  }

  onStatusChange(value: string): void {
    this.store.setStatus(value as EquipmentStatusEnum);
  }

  // ==================== SUBMIT ====================

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      const type = this.store.formData().type === EquipmentTypeEnum.CABINET ? 'cabinet' : 'panel';
      this.router.navigate(['/equipments', type, result.id]);
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/equipments']);
  }

  // ==================== HELPERS ====================

  getEquipmentTypeLabel = getEquipmentTypeLabel;
  getEquipmentStatusLabel = getEquipmentStatusLabel;

  /**
   * Labels dinámicos según el tipo seleccionado
   */
  getTypeLabel(): string {
    return this.store.formData().type === EquipmentTypeEnum.CABINET ? 'Gabinete' : 'Panel';
  }

  getTagLabel(): string {
    return `Tag del ${this.getTypeLabel()}`;
  }

  getEquipmentTypeSelectLabel(): string {
    return `Tipo de ${this.getTypeLabel()}`;
  }

  getEquipmentTypeSelectPlaceholder(): string {
    return `Selecciona tipo de ${this.getTypeLabel().toLowerCase()}`;
  }

  getCommunicationProtocolLabel(): string {
    return 'Protocolo de Comunicación';
  }

  getStatusLabel(): string {
    return 'Estado';
  }
}

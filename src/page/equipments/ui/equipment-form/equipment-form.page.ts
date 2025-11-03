import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EquipmentFormStore} from '../../model/equipment-form.store';
import {EquipmentStatusEnum, getEquipmentStatusLabel} from '../../../../entities/equipment/model/equipment-status.enum';
import {EquipmentTypeEnum, getEquipmentTypeLabel} from '../../../../shared/model/enums/equipment-type.enum';

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
    const equipmentId = this.route.snapshot.paramMap.get('id');

    const fullPath = this.router.url;
    console.log('🔍 URL completa:', fullPath);

    let type: EquipmentTypeEnum;

    if (fullPath.includes('/panel/')) {
      type = EquipmentTypeEnum.PANEL;
      console.log('✅ Tipo detectado: PANEL');
    } else if (fullPath.includes('/cabinet/')) {
      type = EquipmentTypeEnum.CABINET;
      console.log('✅ Tipo detectado: CABINET');
    } else {
      // Fallback: leer de route param si existe
      const equipmentType = this.route.snapshot.paramMap.get('type');
      type = equipmentType === 'panel'
        ? EquipmentTypeEnum.PANEL
        : EquipmentTypeEnum.CABINET;
      console.log('✅ Tipo detectado desde param:', type);
    }

    if (equipmentId && equipmentId !== 'new') {
      console.log('🔧 Modo: EDITAR');
      console.log('  ID:', equipmentId);
      console.log('  Type:', type);
      this.store.initializeForEdit(equipmentId, type);
    } else {
      console.log('🔧 Modo: CREAR');
      console.log('  Type:', type);
      this.store.initializeForCreate(type);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== STEPPER NAVIGATION ====================

  onNext(): void {
    this.store.goToNextStep();
  }

  onPrevious(): void {
    this.store.goToPreviousStep();
  }

  onGoToStep(step: number): void {
    // Solo permitir ir a steps ya visitados o el siguiente inmediato
    const currentStep = this.store.currentStep();
    const completedSteps = this.store.completedSteps();

    if (step <= currentStep || completedSteps.has(step - 1)) {
      this.store.goToStep(step);
    }
  }

  // ==================== TYPE CHANGE ====================

  onTypeChange(newType: EquipmentTypeEnum): void {
    if (this.store.isEditing() && this.store.formData().type !== newType) {
      this.pendingTypeChange.set(newType);
      this.showTypeChangeModal.set(true);
    } else {
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

  onReferenceLocationChange(value: string): void {
    this.store.setReferenceLocation(value);
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
      this.router.navigate(['/equipments', type, result.id]).then();
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/equipments']).then();
  }

  // ==================== HELPERS ====================

  getEquipmentTypeLabel = getEquipmentTypeLabel;
  getEquipmentStatusLabel = getEquipmentStatusLabel;

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

  // ==================== STEPPER HELPERS ====================

  isStepCompleted(step: number): boolean {
    return this.store.completedSteps().has(step);
  }

  isStepActive(step: number): boolean {
    return this.store.currentStep() === step;
  }

  canAccessStep(step: number): boolean {
    const currentStep = this.store.currentStep();
    const completedSteps = this.store.completedSteps();

    // En modo edición, todos los steps son accesibles
    if (this.store.isEditing()) {
      return true;
    }

    // En modo creación, solo puede acceder a steps completados o el actual
    return step <= currentStep || completedSteps.has(step - 1);
  }

  getStepIcon(step: number): string {
    const icons: Record<number, string> = {
      1: 'pi-box',
      2: 'pi-tag',
      3: 'pi-map-marker',
      4: 'pi-cog'
    };
    return icons[step] || 'pi-circle';
  }

  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Tipo',
      2: 'Identificación',
      3: 'Ubicación',
      4: 'Especificaciones'
    };
    return titles[step] || '';
  }
}

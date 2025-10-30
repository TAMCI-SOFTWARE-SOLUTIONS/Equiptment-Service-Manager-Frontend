import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { Steps } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import {ServiceWorkStore} from '../../model/store/service-work.store';
import {ServiceStatusEnum} from '../../../../entities/equipment-service';
import {EquipmentTypeEnum, ServiceTypeEnum} from '../../../../shared/model';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {
  CONDITION_BY_TYPE,
  CONDITION_LABELS,
  CRITICALITY_LABELS,
  INSPECTABLE_TYPE_LABELS, isItemCompleted, requiresCriticality
} from '../../utils/service-work-validation.helpers';
import {InspectableItemWithDetails} from '../../model/interfaces/inspectable-item-with-details.interface';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';

@Component({
  selector: 'app-service-work',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Ripple,
    Steps,
    ConfirmationModalComponent,
    EmptyStateComponent
  ],
  providers: [ServiceWorkStore],
  templateUrl: './service-work.page.html',
  styleUrls: ['./service-work.page.css']
})
export class ServiceWorkPage implements OnInit, OnDestroy {
  readonly store = inject(ServiceWorkStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  // Expose enums to template
  readonly ServiceStatusEnum = ServiceStatusEnum;
  readonly ServiceTypeEnum = ServiceTypeEnum;
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  readonly InspectableItemTypeEnum = InspectableItemTypeEnum;
  readonly ItemConditionEnum = ItemConditionEnum;
  readonly CriticalityEnum = CriticalityEnum;

  // Expose helpers to template
  readonly CONDITION_LABELS = CONDITION_LABELS;
  readonly CRITICALITY_LABELS = CRITICALITY_LABELS;
  readonly INSPECTABLE_TYPE_LABELS = INSPECTABLE_TYPE_LABELS;
  readonly requiresCriticality = requiresCriticality;
  readonly isItemCompleted = isItemCompleted;

  // Stepper items
  stepperItems: MenuItem[] = [
    { label: 'Información' },
    { label: 'Inspección' },
    { label: 'Evidencias' },
    { label: 'Completar' }
  ];

  // Tab items para tipos de inspectable
  inspectableTypeTabs = [
    { type: InspectableItemTypeEnum.COMMUNICATION, label: 'Comunicación', icon: 'pi-wifi' },
    { type: InspectableItemTypeEnum.STATE, label: 'Estado', icon: 'pi-info-circle' },
    { type: InspectableItemTypeEnum.POWER_SUPPLY, label: 'Fuentes', icon: 'pi-bolt' },
    { type: InspectableItemTypeEnum.POWER_120VAC, label: '120 VAC', icon: 'pi-flash' },
    { type: InspectableItemTypeEnum.ORDER_AND_CLEANLINESS, label: 'Orden y Limpieza', icon: 'pi-check-square' },
    { type: InspectableItemTypeEnum.OTHERS, label: 'Otros', icon: 'pi-ellipsis-h' }
  ];

  // Modal states
  readonly showStartModal = signal(false);
  readonly showCompleteModal = signal(false);
  readonly showExitModal = signal(false);

  // File input references
  videoStartInput: HTMLInputElement | null = null;
  videoEndInput: HTMLInputElement | null = null;
  photoInputs: { [key: string]: HTMLInputElement | null } = {};

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.store.loadService(serviceId);
    } else {
      this.router.navigate(['/services']);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== NAVIGATION ====================

  onStepChange(step: number): void {
    // Verificar que el servicio esté iniciado para avanzar más allá del step 1
    if (step > 1 && !this.store.isServiceInProgress()) {
      return;
    }
    this.store.setCurrentStep(step + 1); // Steps usa índice 0-based
  }

  goToStep(step: number): void {
    if (step === 1 || this.store.isServiceInProgress()) {
      this.store.setCurrentStep(step);
    }
  }

  onBack(): void {
    const currentStep = this.store.currentStep();
    if (currentStep > 1) {
      this.store.setCurrentStep(currentStep - 1);
    }
  }

  onNext(): void {
    const currentStep = this.store.currentStep();
    if (currentStep < 4) {
      this.store.setCurrentStep(currentStep + 1);
    }
  }

  async onExit(): Promise<void> {
    // Si hay cambios sin guardar, mostrar confirmación
    if (this.store.hasUnsavedChanges()) {
      this.showExitModal.set(true);
    } else {
      this.router.navigate(['/services/active']);
    }
  }

  async confirmExit(): Promise<void> {
    // Guardar cambios antes de salir
    await this.store.saveAllProgress();
    this.showExitModal.set(false);
    this.router.navigate(['/services/active']);
  }

  cancelExit(): void {
    this.showExitModal.set(false);
  }

  // ==================== SERVICE ACTIONS ====================

  onStartServiceClick(): void {
    this.showStartModal.set(true);
  }

  async confirmStartService(): Promise<void> {
    const success = await this.store.startService();
    if (success) {
      this.showStartModal.set(false);
    }
  }

  cancelStartService(): void {
    this.showStartModal.set(false);
  }

  // ==================== STEP 2: INSPECTION ====================

  onInspectableTypeChange(type: InspectableItemTypeEnum): void {
    this.store.setCurrentInspectableType(type);
  }

  getConditionOptions(itemType: InspectableItemTypeEnum): ItemConditionEnum[] {
    return CONDITION_BY_TYPE[itemType] || [];
  }

  onConditionChange(item: InspectableItemWithDetails, condition: ItemConditionEnum): void {
    this.store.updateItemCondition(item.id, condition);
  }

  onCriticalityChange(item: InspectableItemWithDetails, criticality: CriticalityEnum | null): void {
    this.store.updateItemCriticality(item.id, criticality);
  }

  onObservationChange(item: InspectableItemWithDetails, observation: string): void {
    this.store.updateItemObservation(item.id, observation);
  }

  async saveProgress(): Promise<void> {
    await this.store.saveAllProgress();
  }

  // ==================== STEP 3: EVIDENCES ====================

  onVideoStartClick(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        this.store.uploadFile(file, 'videoStart');
      }
    };
    input.click();
  }

  onVideoEndClick(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        this.store.uploadFile(file, 'videoEnd');
      }
    };
    input.click();
  }

  onPhotoClick(type: 'startPhoto' | 'midPhoto' | 'endPhoto'): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        this.store.uploadFile(file, type);
      }
    };
    input.click();
  }

  onReportClick(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        this.store.uploadFile(file, 'report');
      }
    };
    input.click();
  }

  async removePhoto(photoId: string, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<void> {
    await this.store.removePhoto(photoId, type);
  }

  // ==================== STEP 4: COMPLETE ====================

  onCompleteServiceClick(): void {
    if (!this.store.canCompleteService()) {
      return;
    }
    this.showCompleteModal.set(true);
  }

  async confirmCompleteService(): Promise<void> {
    const success = await this.store.completeService();
    if (success) {
      this.showCompleteModal.set(false);
      this.router.navigate(['/services/active']);
    }
  }

  cancelCompleteService(): void {
    this.showCompleteModal.set(false);
  }

  // ==================== HELPERS ====================

  getServiceTypeLabel(type: ServiceTypeEnum): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
    };
    return labels[type] || type;
  }

  getEquipmentTypeLabel(type: EquipmentTypeEnum): string {
    return type === EquipmentTypeEnum.CABINET ? 'Cabinet' : 'Panel';
  }

  getProgressColor(percentage: number): string {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-rose-500';
    if (percentage < 70) return 'bg-amber-500';
    if (percentage < 100) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getItemStatusIcon(item: InspectableItemWithDetails): string {
    if (item.isSaving) return 'pi-spin pi-spinner';
    if (isItemCompleted(item.inspection?.condition || null, item.inspection?.criticality || null)) {
      return 'pi-check-circle';
    }
    if (item.inspection?.condition) return 'pi-clock';
    return 'pi-circle';
  }

  getItemStatusClass(item: InspectableItemWithDetails): string {
    if (item.isSaving) return 'text-blue-500';
    if (isItemCompleted(item.inspection?.condition || null, item.inspection?.criticality || null)) {
      return 'text-green-500';
    }
    if (item.inspection?.condition) return 'text-amber-500';
    return 'text-gray-400';
  }

  formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getValidationMessages(): string[] {
    const messages: string[] = [];
    const service = this.store.service();
    const progress = this.store.inspectionProgress();
    const evidence = this.store.evidenceValidation();

    if (!service) return messages;

    // Inspecciones
    if (progress.completed < progress.total) {
      messages.push(`Completa las ${progress.total - progress.completed} inspecciones pendientes`);
    }

    // Evidencias
    if (evidence && !evidence.isComplete) {
      if (!evidence.videoStart) messages.push('Sube el video de inicio');
      if (!evidence.videoEnd) messages.push('Sube el video final');
      if (!evidence.startPhotos) messages.push('Sube fotos de inicio (1-3)');
      if (!evidence.midPhotos) messages.push('Sube fotos del medio (1-3)');
      if (!evidence.endPhotos) messages.push('Sube fotos finales (1-3)');
      if (!evidence.reportDocument) messages.push('Sube el reporte PDF');
    }

    // Levantamiento
    if (service.type === ServiceTypeEnum.RAISE_OBSERVATION) {
      const items = this.store.inspectableItems();
      const invalidItems = items.filter(item =>
        !this.isValidForRaiseObservation(item)
      );
      if (invalidItems.length > 0) {
        messages.push(`${invalidItems.length} items aún tienen criticidad (deben estar en estado OK u Operativo)`);
      }
    }

    return messages;
  }

  isValidForRaiseObservation(item: InspectableItemWithDetails): boolean {
    const condition = item.inspection?.condition;
    const criticality = item.inspection?.criticality;

    if (!condition) return false;

    const validConditions = [ItemConditionEnum.OPERATIONAL, ItemConditionEnum.OK];
    return validConditions.includes(condition) && criticality === null;
  }
}

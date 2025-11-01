import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceWorkStore } from '../../model/store/service-work.store';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { MenuItem } from 'primeng/api';
import { ServiceTypeEnum } from '../../../../shared/model';
import {ServiceWorkHeaderComponent} from '../service-work-header/service-work-header.component';
import {ServiceWorkFooterComponent} from '../service-work-footer/service-work-footer.component';
import {ServiceInfoCardComponent} from '../service-card-info/service-card-info.component';
import {EquipmentInfoCardComponent} from '../equipment-card-info/equipment-card-info.component';
import {PowerDistributionListComponent} from '../power-distribution-list/power-distribution-list.component';
import {ServiceStatusEnum} from '../../../../entities/equipment-service';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CONDITION_BY_TYPE} from '../../utils/service-work-validation.helpers';
// 🆕 CAMBIO: Importar la nueva interfaz plana
import { ItemInspectionWithDetails } from '../../model/interfaces/item-inspection-with-details.interface';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {InspectionItemFormComponent} from '../inspection-item-form/inspection-item-form.component';
import {InspectionTabsComponent} from '../inspection-tabs/inspection-tabs.component';
import {InspectionProgressBannerComponent} from '../inspection-progress-banner/inspection-progress-banner.component';

@Component({
  selector: 'app-service-work',
  standalone: true,
  imports: [
    CommonModule,
    ServiceWorkHeaderComponent,
    ServiceWorkFooterComponent,
    ConfirmationModalComponent,
    EmptyStateComponent,
    ServiceInfoCardComponent,
    EquipmentInfoCardComponent,
    PowerDistributionListComponent,
    InspectionItemFormComponent,
    InspectionTabsComponent,
    InspectionProgressBannerComponent
  ],
  providers: [ServiceWorkStore],
  templateUrl: './service-work.page.html'
})
export class ServiceWorkPage implements OnInit, OnDestroy {
  readonly store = inject(ServiceWorkStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  // Stepper items
  stepperItems: MenuItem[] = [
    { label: 'Información' },
    { label: 'Inspección' },
    { label: 'Evidencias' },
    { label: 'Completar' }
  ];

  // Modal states
  readonly showStartModal = signal(false);
  readonly showCompleteModal = signal(false);
  readonly showExitModal = signal(false);

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.store.loadService(serviceId);
    } else {
      this.router.navigate(['/services/active']);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== NAVIGATION ====================
  // --- (Sin cambios en esta sección) ---
  onStepChange(stepIndex: number): void {
    this.store.setCurrentStep(stepIndex + 1); // Steps usa índice 0-based
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
    if (this.store.hasUnsavedChanges()) {
      this.showExitModal.set(true);
    } else {
      this.router.navigate(['/services/active']);
    }
  }

  async confirmExit(): Promise<void> {
    await this.store.saveAllProgress();
    this.showExitModal.set(false);
    this.router.navigate(['/services/active']);
  }

  cancelExit(): void {
    this.showExitModal.set(false);
  }

  // ==================== SERVICE ACTIONS ====================
  // --- (Sin cambios en esta sección) ---
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

  async saveProgress(): Promise<void> {
    await this.store.saveAllProgress();
  }

  // ==================== HELPERS ====================
  // --- (Sin cambios en esta sección) ---

  getSubtitle(): string {
    const service = this.store.service();
    const equipment = this.store.equipment();

    if (!service || !equipment) return '';

    const typeLabel = this.getServiceTypeLabel(service.type);
    return `${typeLabel} - ${equipment.tag}`;
  }

  getStepLabel(step: number): string {
    const labels: Record<number, string> = {
      1: 'Información',
      2: 'Inspección',
      3: 'Evidencias',
      4: 'Completar'
    };
    return labels[step] || '';
  }

  getServiceTitle(): string {
    const service = this.store.service();
    const equipment = this.store.equipment();

    if (!service || !equipment) return 'Cargando...';

    const typeLabel = this.getServiceTypeLabel(service.type);
    return `${typeLabel} | ${equipment.tag}`;
  }

  getProgress(): number {
    const currentStep = this.store.currentStep();
    return (currentStep / 4) * 100;
  }

  onStepClick(step: number): void {
    this.store.setCurrentStep(step);
  }

  getServiceTypeLabel(type: ServiceTypeEnum): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
    };
    return labels[type] || type;
  }

  shouldShowStartButton(): boolean {
    const service = this.store.service();
    return service?.status === ServiceStatusEnum.CREATED && this.store.currentStep() === 1;
  }

  getNextButtonLabel(): string {
    const service = this.store.service();
    const step = this.store.currentStep();

    if (service?.status === ServiceStatusEnum.CREATED && step === 1) {
      return 'Comenzar';
    }

    if (step === 1) return 'Ir a Inspección';
    if (step === 2) return 'Ir a Evidencias';
    if (step === 3) return 'Ir a Resumen';
    return 'Siguiente';
  }

  async onNextOrStart(): Promise<void> {
    const service = this.store.service();
    const currentStep = this.store.currentStep();

    if (service?.status === ServiceStatusEnum.CREATED && currentStep === 1) {
      const success = await this.store.startService();
      if (success) {
        console.log('✅ Servicio iniciado, avanzando a step 2');
      }
    } else {
      this.onNext();
    }
  }

  // ==================== INSPECTION HANDLERS ====================
  // 🆕 CAMBIO: Métodos actualizados para usar la nueva interfaz

  onInspectableTypeChange(type: InspectableItemTypeEnum): void {
    this.store.setCurrentInspectableType(type);
  }

  getConditionOptions(itemType: InspectableItemTypeEnum): ItemConditionEnum[] {
    return CONDITION_BY_TYPE[itemType] || [];
  }

  onConditionChange(item: ItemInspectionWithDetails, condition: ItemConditionEnum | null): void {
    // El 'item.id' ahora es el 'inspectionId', que es lo que el store espera.
    this.store.updateItemCondition(item.id, condition);
  }

  onCriticalityChange(item: ItemInspectionWithDetails, criticality: CriticalityEnum | null): void {
    // El 'item.id' ahora es el 'inspectionId'
    this.store.updateItemCriticality(item.id, criticality);
  }

  onObservationChange(item: ItemInspectionWithDetails, observation: string | null): void {
    // El 'item.id' ahora es el 'inspectionId'
    this.store.updateItemObservation(item.id, observation);
  }

  protected readonly ServiceStatusEnum = ServiceStatusEnum;
}

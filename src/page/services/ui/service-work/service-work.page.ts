import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceWorkStore} from '../../model/store/service-work.store';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {MessageService} from 'primeng/api';
import {ServiceTypeEnum} from '../../../../shared/model';
import {ServiceWorkHeaderComponent} from '../service-work-header/service-work-header.component';
import {ServiceWorkFooterComponent} from '../service-work-footer/service-work-footer.component';
import {ServiceInfoCardComponent} from '../service-card-info/service-card-info.component';
import {EquipmentInfoCardComponent} from '../equipment-card-info/equipment-card-info.component';
import {PowerDistributionListComponent} from '../power-distribution-list/power-distribution-list.component';
import {ServiceStatusEnum} from '../../../../entities/equipment-service';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CONDITION_BY_TYPE, ValidationError} from '../../utils/service-work-validation.helpers';
import {ItemInspectionWithDetails} from '../../model/interfaces/item-inspection-with-details.interface';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {InspectionItemFormComponent} from '../inspection-item-form/inspection-item-form.component';
import {InspectionTabsComponent} from '../inspection-tabs/inspection-tabs.component';
import {InspectionProgressBannerComponent} from '../inspection-progress-banner/inspection-progress-banner.component';
import {FileService} from '../../../../entities/file/api/file.service';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {firstValueFrom} from 'rxjs';
import {WebcamModule} from 'ngx-webcam';
import {EvidenceSectionComponent} from '../evidence-section/evidence-section.component';
import {VideoUploaderComponent} from '../video-uploader/video-uploader.component';
import {PhotoUploaderComponent} from '../photo-uploader/photo-uploader.component';
import {ReportUploaderComponent} from '../report-uploader/report-uploader.component';
import {FilePreviewModalComponent} from '../file-preview-modal/file-preview-modal.component';
import {PreviewFile, PreviewFileType} from '../../model/types/file-preview-modal.types';
import {CameraModalComponent} from '../camera-modal/camera-modal.component';
import {ServiceWorkSummaryComponent} from '../service-work-summary/service-work-summary.component';

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
    InspectionProgressBannerComponent,
    WebcamModule,
    EvidenceSectionComponent,
    VideoUploaderComponent,
    PhotoUploaderComponent,
    ReportUploaderComponent,
    FilePreviewModalComponent,
    CameraModalComponent,
    ServiceWorkSummaryComponent
  ],
  providers: [ServiceWorkStore],
  templateUrl: './service-work.page.html',
  styleUrls: ['./service-work.page.css']
})
export class ServiceWorkPage implements OnInit, OnDestroy {
  readonly store = inject(ServiceWorkStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fileService = inject(FileService);
  private readonly messageService = inject(MessageService);

  readonly showStartModal = signal(false);
  readonly showCompleteModal = signal(false);
  readonly showExitModal = signal(false);
  readonly showPreviewModal = signal(false);
  readonly previewFiles = signal<PreviewFile[]>([]);
  readonly previewCurrentIndex = signal(0);
  readonly showCameraModal = signal(false);
  readonly cameraMode = signal<'photo' | 'video'>('photo');
  readonly cameraTargetType = signal<string | null>(null);

  protected readonly ServiceStatusEnum = ServiceStatusEnum;

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.store.loadService(serviceId);
    } else {
      this.router.navigate(['/services/active']).then();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
    this.closePreviewModal();
  }

  cancelExit(): void {
    this.showExitModal.set(false);
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
      await this.router.navigate(['/services/active']);
    }
  }

  cancelCompleteService(): void {
    this.showCompleteModal.set(false);
  }

  async openPreviewModal(file: FileEntity): Promise<void> {
    try {
      const url = await firstValueFrom(this.fileService.viewFileAsUrl(file.id));

      const type = this.getFileType(file.contentType);

      const previewFile: PreviewFile = {
        fileEntity: file,
        url,
        type
      };

      this.previewFiles.set([previewFile]);
      this.previewCurrentIndex.set(0);
      this.showPreviewModal.set(true);

    } catch (error) {
      console.error('❌ Error loading preview:', error);
      alert('Error al cargar la vista previa. Intenta de nuevo.');
    }
  }

  closePreviewModal(): void {
    console.log('🚪 Closing preview modal');
    this.showPreviewModal.set(false);

    // Esperar a que termine la animación de cierre
    setTimeout(() => {
      // Liberar URLs de blob para evitar memory leaks
      this.previewFiles().forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });

      // Limpiar estado
      this.previewFiles.set([]);
      this.previewCurrentIndex.set(0);

      console.log('✅ Preview modal cleaned');
    }, 300);
  }

  onDownloadFileFromPreview(previewFile: PreviewFile): void {
    console.log('💾 Downloading:', previewFile.fileEntity.originalName);

    const link = document.createElement('a');
    link.href = previewFile.url!;
    link.download = previewFile.fileEntity.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Download initiated');
  }

  handlePreviewError(error: string): void {
    console.error('❌ Preview error:', error);
    // TODO: Mostrar toast de error
    alert(`Error: ${error}`);
  }

  private getFileType(contentType: string): PreviewFileType {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType === 'application/pdf') return 'pdf';
    return 'unknown';
  }

  onInspectableTypeChange(type: InspectableItemTypeEnum): void {
    this.store.setCurrentInspectableType(type);
  }

  getConditionOptions(itemType: InspectableItemTypeEnum): ItemConditionEnum[] {
    return CONDITION_BY_TYPE[itemType] || [];
  }

  onConditionChange(item: ItemInspectionWithDetails, condition: ItemConditionEnum | null): void {
    this.store.updateItemCondition(item.id, condition);
  }

  onCriticalityChange(item: ItemInspectionWithDetails, criticality: CriticalityEnum | null): void {
    this.store.updateItemCriticality(item.id, criticality);
  }

  onObservationChange(item: ItemInspectionWithDetails, observation: string | null): void {
    this.store.updateItemObservation(item.id, observation);
  }

  async onUploadVideo(file: File, type: 'videoStart' | 'videoEnd'): Promise<void> {
    const success = await this.store.uploadFile(file, type);
    if (success) {
      console.log(`✅ Video ${type} subido correctamente`);
      await this.store.loadEvidenceFiles();
    }
  }

  async onUploadPhoto(file: File, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<void> {
    const success = await this.store.uploadFile(file, type);
    if (success) {
      console.log(`✅ Foto ${type} subida correctamente`);
      await this.store.loadEvidenceFiles();
    }
  }

  async onUploadReport(file: File): Promise<void> {
    const success = await this.store.uploadFile(file, 'report');
    if (success) {
      console.log('✅ Reporte subido correctamente');
      await this.store.loadEvidenceFiles();
    }
  }

  async onRemoveVideo(type: 'videoStart' | 'videoEnd'): Promise<void> {
    const success = await this.store.removeVideo(type);
    if (success) {
      console.log(`✅ Video ${type} eliminado correctamente`);
      await this.store.loadEvidenceFiles();
    }
  }

  async onRemovePhoto(photoId: string, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<void> {
    const success = await this.store.removePhoto(photoId, type);
    if (success) {
      console.log(`✅ Foto eliminada correctamente`);
      await this.store.loadEvidenceFiles();
    }
  }

  async onRemoveReport(): Promise<void> {
    const success = await this.store.removeReport();
    if (success) {
      console.log('✅ Reporte eliminado correctamente');
      await this.store.loadEvidenceFiles();
    }
  }

  openCameraModal(targetType: string): void {
    this.cameraTargetType.set(targetType);
    this.cameraMode.set(targetType.startsWith('video') ? 'video' : 'photo');
    this.showCameraModal.set(true);
  }

  closeCameraModal(): void {
    this.showCameraModal.set(false);
    this.cameraTargetType.set(null);
  }

  async onCameraCapture(file: File): Promise<void> {
    const targetType = this.cameraTargetType();
    if (!targetType) return;

    const success = await this.store.uploadFile(file, targetType as any);
    if (success) {
      console.log(`✅ Archivo ${targetType} capturado y subido correctamente`);
      await this.store.loadEvidenceFiles();
    }
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

  get unsavedChangesCount(): number {
    return this.store.itemInspections().filter(i => i.hasUnsavedChanges).length;
  }

  async saveProgress(): Promise<void> {
    console.log('💾 Attempting to save progress...');

    const result = await this.store.saveAllProgress();

    if (result.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Cambios guardados',
        detail: 'Todos los cambios se guardaron correctamente',
        life: 3000
      });
      console.log('✅ All changes saved successfully');
    } else {
      if (result.errors.length > 0) {
        this.showValidationErrors(result.errors);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al guardar',
          detail: 'Ocurrió un error al guardar los cambios. Intenta de nuevo.',
          life: 5000
        });
      }
    }
  }

  private showValidationErrors(errors: ValidationError[]): void {
    console.error('❌ Validation errors:', errors);

    // Mostrar primer error con detalle
    const firstError = errors[0];
    this.messageService.add({
      severity: 'error',
      summary: 'Validación fallida',
      detail: firstError.message,
      life: 5000
    });

    if (errors.length > 1) {
      this.messageService.add({
        severity: 'warn',
        summary: `${errors.length - 1} errores adicionales`,
        detail: 'Revisa todos los items marcados en rojo',
        life: 5000
      });
    }
  }

  canNavigateToStep(_: number): boolean {
    const currentStep = this.store.currentStep();

    if (currentStep === 2 && this.store.hasUnsavedChanges()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cambios sin guardar',
        detail: 'Guarda los cambios antes de continuar',
        life: 4000
      });
      return false;
    }

    return true;
  }

  onNext(): void {
    const currentStep = this.store.currentStep();
    const targetStep = currentStep + 1;

    if (!this.canNavigateToStep(targetStep)) {
      return;
    }

    if (currentStep < 4) {
      this.store.setCurrentStep(targetStep);
    }
  }

  onBack(): void {
    const currentStep = this.store.currentStep();
    const targetStep = currentStep - 1;

    if (!this.canNavigateToStep(targetStep)) {
      return; // ❌ Bloqueado
    }

    // ✅ Permitir navegación
    if (currentStep > 1) {
      this.store.setCurrentStep(targetStep);
    }
  }

  onStepClick(step: number): void {
    if (!this.canNavigateToStep(step)) {
      return; // ❌ Bloqueado
    }

    this.store.setCurrentStep(step);
  }

  async onExit(): Promise<void> {
    if (this.store.hasUnsavedChanges()) {
      // Mostrar modal de confirmación
      this.showExitModal.set(true);
    } else {
      await this.router.navigate(['/services/active']);
    }
  }

  async confirmExit(): Promise<void> {
    const result = await this.store.saveAllProgress();

    if (result.success) {
      this.showExitModal.set(false);
      await this.router.navigate(['/services/active']);
    } else {
      if (result.errors.length > 0) {
        this.showValidationErrors(result.errors);
      }
      this.showExitModal.set(false);
    }
  }
}

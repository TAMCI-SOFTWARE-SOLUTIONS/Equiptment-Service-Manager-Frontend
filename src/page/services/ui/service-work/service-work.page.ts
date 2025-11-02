import {Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceWorkStore} from '../../model/store/service-work.store';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {MenuItem} from 'primeng/api';
import {ServiceTypeEnum} from '../../../../shared/model';
import {ServiceWorkHeaderComponent} from '../service-work-header/service-work-header.component';
import {ServiceWorkFooterComponent} from '../service-work-footer/service-work-footer.component';
import {ServiceInfoCardComponent} from '../service-card-info/service-card-info.component';
import {EquipmentInfoCardComponent} from '../equipment-card-info/equipment-card-info.component';
import {PowerDistributionListComponent} from '../power-distribution-list/power-distribution-list.component';
import {ServiceStatusEnum} from '../../../../entities/equipment-service';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CONDITION_BY_TYPE} from '../../utils/service-work-validation.helpers';
import {ItemInspectionWithDetails} from '../../model/interfaces/item-inspection-with-details.interface';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {InspectionItemFormComponent} from '../inspection-item-form/inspection-item-form.component';
import {InspectionTabsComponent} from '../inspection-tabs/inspection-tabs.component';
import {InspectionProgressBannerComponent} from '../inspection-progress-banner/inspection-progress-banner.component';
import {FileService} from '../../../../entities/file/api/file.service';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {firstValueFrom, Subject} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamModule} from 'ngx-webcam';
import {EvidenceSectionComponent} from '../evidence-section/evidence-section.component';
import {VideoUploaderComponent} from '../video-uploader/video-uploader.component';
import {PhotoUploaderComponent} from '../photo-uploader/photo-uploader.component';
import {ReportUploaderComponent} from '../report-uploader/report-uploader.component';
import {FilePreviewModalComponent} from '../file-preview-modal/file-preview-modal.component';
import {PreviewFile, PreviewFileType} from '../../model/types/file-preview-modal.types';
import {CameraModalComponent} from '../camera-modal/camera-modal.component';

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
    CameraModalComponent
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

  // ... código existente (stepperItems, modals, etc.)
  stepperItems: MenuItem[] = [
    { label: 'Información' },
    { label: 'Inspección' },
    { label: 'Evidencias' },
    { label: 'Completar' }
  ];

  readonly showStartModal = signal(false);
  readonly showCompleteModal = signal(false);
  readonly showExitModal = signal(false);

  // ==================== 🆕 PREVIEW MODAL STATE ====================

  readonly showPreviewModal = signal(false);
  readonly previewFiles = signal<PreviewFile[]>([]);
  readonly previewCurrentIndex = signal(0);

  // ==================== LIFECYCLE ====================

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
    this.closePreviewModal(); // 🆕 Limpiar al destruir
  }

  // ==================== NAVIGATION ====================

  onStepChange(stepIndex: number): void {
    this.store.setCurrentStep(stepIndex + 1);
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

  // ==================== 🆕 FILE PREVIEW METHODS ====================

  /**
   * Abre el modal de preview para UN SOLO archivo
   */
  async openPreviewModal(file: FileEntity): Promise<void> {
    try {
      console.log('🔍 Opening preview for:', file.originalName);

      // Cargar URL del archivo
      const url = await firstValueFrom(this.fileService.viewFileAsUrl(file.id));
      console.log('✅ URL loaded');

      // Determinar tipo de archivo
      const type = this.getFileType(file.contentType);
      console.log('📄 File type:', type);

      // Crear PreviewFile CON LA URL
      const previewFile: PreviewFile = {
        fileEntity: file,
        url, // ✅ IMPORTANTE: URL ya cargada
        type
      };

      // 🔧 FIX: Configurar TODO de una vez
      this.previewFiles.set([previewFile]);
      this.previewCurrentIndex.set(0);
      this.showPreviewModal.set(true);

      console.log('✅ Preview modal opened');
    } catch (error) {
      console.error('❌ Error loading preview:', error);
      alert('Error al cargar la vista previa. Intenta de nuevo.');
    }
  }

  /**
   * Abre el modal de preview para MÚLTIPLES archivos (galería)
   * Útil si quieres navegar entre todas las fotos de una sección
   */
  async openPreviewGallery(files: FileEntity[], startIndex: number = 0): Promise<void> {
    try {
      console.log('🖼️ Opening gallery with', files.length, 'files');

      // Cargar URLs de todos los archivos en paralelo
      const previewFilesPromises = files.map(async (file) => {
        const url = await firstValueFrom(this.fileService.viewFileAsUrl(file.id));
        const type = this.getFileType(file.contentType);

        return {
          fileEntity: file,
          url,
          type
        } as PreviewFile;
      });

      const previewFiles = await Promise.all(previewFilesPromises);

      // Configurar modal
      this.previewFiles.set(previewFiles);
      this.previewCurrentIndex.set(startIndex);
      this.showPreviewModal.set(true);

      console.log('✅ Gallery opened');
    } catch (error) {
      console.error('❌ Error loading gallery:', error);
      alert('Error al cargar la galería. Intenta de nuevo.');
    }
  }

  /**
   * Cierra el modal y limpia recursos
   */
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

  /**
   * Maneja la descarga de archivos desde el modal
   */
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

  /**
   * Maneja errores del modal de preview
   */
  handlePreviewError(error: string): void {
    console.error('❌ Preview error:', error);
    // TODO: Mostrar toast de error
    alert(`Error: ${error}`);
  }

  /**
   * Helper: Determina el tipo de archivo según el MIME type
   */
  private getFileType(contentType: string): PreviewFileType {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType === 'application/pdf') return 'pdf';
    return 'unknown';
  }

  // ==================== STEP 2: INSPECTION ====================

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

  // ==================== STEP 3: EVIDENCES ====================

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

  // ==================== CAMERA MODAL (código existente) ====================

  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement> | undefined;

  readonly showCameraModal = signal(false);
  readonly cameraMode = signal<'photo' | 'video'>('photo');
  readonly cameraTargetType = signal<string | null>(null);
  readonly isPhotoCapture = signal(true);
  readonly isRecording = signal(false);
  readonly capturedImagePreview = signal<string | null>(null);
  readonly capturedVideoPreviewUrl = signal<string | null>(null);
  private capturedVideoBlob: Blob | null = null;

  readonly cameraTrigger: Subject<void> = new Subject<void>();
  readonly switchCamera: Subject<boolean | string> = new Subject<boolean | string>(); // ✅ Nuevo
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private videoStream: MediaStream | null = null;

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

  private async initializeVideoStream(): Promise<void> {
    try {
      if (this.videoStream) this.stopMediaStream();

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });

      if (this.videoPlayer) {
        this.videoPlayer.nativeElement.srcObject = this.videoStream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara/micrófono:', error);
      this.handleInitError(error as WebcamInitError);
      this.closeCameraModal();
    }
  }

  triggerSnapshot(): void {
    this.cameraTrigger.next();
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    this.capturedImagePreview.set(webcamImage.imageAsDataUrl);
  }

  startRecording(): void {
    if (!this.videoStream || !this.videoPlayer) {
      console.error('Stream o Video Player no están listos.');
      return;
    }

    this.videoPlayer.nativeElement.srcObject = this.videoStream;
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.videoStream, { mimeType: 'video/webm' });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.recordedChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.capturedVideoBlob = blob;
      this.capturedVideoPreviewUrl.set(URL.createObjectURL(blob));
      this.stopMediaStream();
    };

    this.mediaRecorder.start();
    this.isRecording.set(true);
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isRecording.set(false);
  }

  confirmCapture(): void {
    let file: File | null = null;
    const targetType = this.cameraTargetType();
    if (!targetType) return;

    if (this.capturedImagePreview()) {
      file = this.convertBase64ToFile(this.capturedImagePreview()!, `captura-${Date.now()}.jpg`);
    } else if (this.capturedVideoBlob) {
      file = new File([this.capturedVideoBlob], `grabacion-${Date.now()}.webm`, { type: 'video/webm' });
    }

    if (file) {
      this.store.uploadFile(file, targetType as any).then(
        success => {
          if (success) {
            this.store.loadEvidenceFiles();
          }
        }
      );
    }
    this.closeCameraModal();
  }

  discardCapture(): void {
    this.capturedImagePreview.set(null);
    if (this.capturedVideoPreviewUrl()) {
      URL.revokeObjectURL(this.capturedVideoPreviewUrl()!);
    }
    this.capturedVideoPreviewUrl.set(null);
    this.capturedVideoBlob = null;

    if (!this.isPhotoCapture()) {
      this.initializeVideoStream();
    }
  }

  private convertBase64ToFile(base64: string, filename: string): File | null {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return new File([blob], filename, { type: mime });
  }

  handleInitError(error: WebcamInitError | Error): void {
    console.error('Error de Webcam:', error);
  }

  private stopMediaStream(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  // ==================== HELPERS ====================

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

  protected readonly ServiceStatusEnum = ServiceStatusEnum;
}

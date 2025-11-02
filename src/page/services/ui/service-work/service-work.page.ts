import {Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceWorkStore } from '../../model/store/service-work.store';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { MenuItem } from 'primeng/api';
import { ServiceTypeEnum } from '../../../../shared/model';
import { ServiceWorkHeaderComponent } from '../service-work-header/service-work-header.component';
import { ServiceWorkFooterComponent } from '../service-work-footer/service-work-footer.component';
import { ServiceInfoCardComponent } from '../service-card-info/service-card-info.component';
import { EquipmentInfoCardComponent } from '../equipment-card-info/equipment-card-info.component';
import { PowerDistributionListComponent } from '../power-distribution-list/power-distribution-list.component';
import { ServiceStatusEnum } from '../../../../entities/equipment-service';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';
import { ItemConditionEnum } from '../../../../shared/model/enums/item-condition.enum';
import { CONDITION_BY_TYPE } from '../../utils/service-work-validation.helpers';
import { ItemInspectionWithDetails } from '../../model/interfaces/item-inspection-with-details.interface';
import { CriticalityEnum } from '../../../../shared/model/enums/criticality.enum';
import { InspectionItemFormComponent } from '../inspection-item-form/inspection-item-form.component';
import { InspectionTabsComponent } from '../inspection-tabs/inspection-tabs.component';
import { InspectionProgressBannerComponent } from '../inspection-progress-banner/inspection-progress-banner.component';
import {FileService} from '../../../../entities/file/api/file.service';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {firstValueFrom, Subject} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamModule} from 'ngx-webcam';
import {Dialog} from 'primeng/dialog';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {EvidenceSectionComponent} from '../evidence-section/evidence-section.component';
import {VideoUploaderComponent} from '../video-uploader/video-uploader.component';
import {PhotoUploaderComponent} from '../photo-uploader/photo-uploader.component';
import {ReportUploaderComponent} from '../report-uploader/report-uploader.component';

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
    Dialog,
    NgxExtendedPdfViewerModule,
    WebcamModule,
    EvidenceSectionComponent,
    VideoUploaderComponent,
    PhotoUploaderComponent,
    ReportUploaderComponent,
    ProgressSpinner,
    ButtonDirective,
    ButtonLabel,
    ButtonIcon,
  ],
  providers: [ServiceWorkStore],
  templateUrl: './service-work.page.html'
})
export class ServiceWorkPage implements OnInit, OnDestroy {
  readonly store = inject(ServiceWorkStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fileService = inject(FileService);

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
  readonly showPreviewModal = signal(false);
  readonly isPreviewLoading = signal(false);
  readonly previewFile = signal<FileEntity | null>(null);
  readonly previewContentUrl = signal<string | undefined>(undefined); // ⬅️ undefined

  // Computed helpers para el tipo de archivo
  readonly isPreviewPdf = computed(() => this.previewFile()?.contentType === 'application/pdf');
  readonly isPreviewImage = computed(() => this.previewFile()?.contentType.startsWith('image/'));
  readonly isPreviewVideo = computed(() => this.previewFile()?.contentType.startsWith('video/'));

  async openPreviewModal(file: FileEntity): Promise<void> {
    this.previewFile.set(file);
    this.isPreviewLoading.set(true);
    this.showPreviewModal.set(true);

    try {
      const url = await firstValueFrom(this.fileService.viewFileAsUrl(file.id));
      this.previewContentUrl.set(url);
    } catch (error) {
      console.error('Error al cargar previsualización', error);
      this.closePreviewModal();
      // TODO: Mostrar un toast de error
    } finally {
      this.isPreviewLoading.set(false);
    }
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.isPreviewLoading.set(false);
    this.previewFile.set(null);

    const url = this.previewContentUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.previewContentUrl.set(undefined); // ⬅️ undefined
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

  /**
   * 🆕 Subir video (inicio o fin)
   */
  async onUploadVideo(file: File, type: 'videoStart' | 'videoEnd'): Promise<void> {
    const success = await this.store.uploadFile(file, type);
    if (success) {
      console.log(`✅ Video ${type} subido correctamente`);
      // Recargar evidencias para actualizar la UI
      await this.store.loadEvidenceFiles();
    }
  }

  /**
   * 🆕 Subir foto
   */
  async onUploadPhoto(file: File, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<void> {
    const success = await this.store.uploadFile(file, type);
    if (success) {
      console.log(`✅ Foto ${type} subida correctamente`);
      // Recargar evidencias para actualizar la UI
      await this.store.loadEvidenceFiles();
    }
  }

  /**
   * 🆕 Subir reporte PDF
   */
  async onUploadReport(file: File): Promise<void> {
    const success = await this.store.uploadFile(file, 'report');
    if (success) {
      console.log('✅ Reporte subido correctamente');
      // Recargar evidencias para actualizar la UI
      await this.store.loadEvidenceFiles();
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

  // Helper para convertir base64 (reutilizado)
  private convertBase64ToFile(base64: string, filename: string): File | null {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], {type:mime});
    return new File([blob], filename, { type: mime });
  }

  handleInitError(error: WebcamInitError | Error): void {
    console.error('Error de Webcam:', error);
    // TODO: Mostrar un toast/alerta al usuario
    // (Ej. "No se pudo acceder a la cámara. Revisa los permisos.")
  }

  // Helper para detener TODOS los tracks del stream y apagar la luz de la cámara
  private stopMediaStream(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    // (ngx-webcam se detiene solo cuando se oculta con @if)
  }

// En: service-work.page.ts

  async onRemoveVideo(type: 'videoStart' | 'videoEnd'): Promise<void> {
    const success = await this.store.removeVideo(type);
    if (success) {
      console.log(`✅ Video ${type} eliminado correctamente`);

      // ⬇️ TE FALTA ESTA LÍNEA ⬇️
      await this.store.loadEvidenceFiles();
    }
  }

  async onRemovePhoto(photoId: string, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<void> {
    const success = await this.store.removePhoto(photoId, type);
    if (success) {
      console.log(`✅ Foto eliminada correctamente`);

      // ⬇️ TE FALTA ESTA LÍNEA ⬇️
      await this.store.loadEvidenceFiles();
    }
  }

  async onRemoveReport(): Promise<void> {
    const success = await this.store.removeReport();
    if (success) {
      console.log('✅ Reporte eliminado correctamente');

      // ⬇️ TE FALTA ESTA LÍNEA ⬇️
      await this.store.loadEvidenceFiles();
    }
  }

  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement> | undefined;

  // --- Propiedades de Modal de Cámara (ACTUALIZADAS) ---
  readonly showCameraModal = signal(false);
  readonly cameraTargetType = signal<string | null>(null);
  readonly isPhotoCapture = signal(true);
  readonly isRecording = signal(false);

  // 🆕 NUEVAS SIGNALS PARA PREVISUALIZACIÓN
  readonly capturedImagePreview = signal<string | null>(null);
  readonly capturedVideoPreviewUrl = signal<string | null>(null);
  private capturedVideoBlob: Blob | null = null; // Para guardar el video temporalmente

  // --- Para Modo Foto (ngx-webcam) ---
  readonly cameraTrigger: Subject<void> = new Subject<void>();

  // --- Para Modo Video (Nativo) ---
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private videoStream: MediaStream | null = null;


  /**
   * Abre el modal de la cámara.
   */
  async openCameraModal(targetType: string): Promise<void> {
    this.cameraTargetType.set(targetType);
    this.isPhotoCapture.set(!targetType.startsWith('video'));
    this.isRecording.set(false);
    this.showCameraModal.set(true);

    // Esperar a que el modal se renderice, luego inicializar el video
    setTimeout(() => {
      if (!this.isPhotoCapture()) {
        this.initializeVideoStream();
      }
    }, 0);
  }

  /**
   * Cierra el modal y limpia TODOS los estados.
   */
  closeCameraModal(): void {
    this.showCameraModal.set(false);
    this.isRecording.set(false);
    this.stopMediaStream();

    // Limpiar previsualizaciones
    this.capturedImagePreview.set(null);
    if (this.capturedVideoPreviewUrl()) {
      URL.revokeObjectURL(this.capturedVideoPreviewUrl()!);
    }
    this.capturedVideoPreviewUrl.set(null);
    this.capturedVideoBlob = null;
  }

  /**
   * 🆕 (NUEVO) Inicializa el stream de video nativo
   */
  private async initializeVideoStream(): Promise<void> {
    try {
      if (this.videoStream) this.stopMediaStream(); // Detener stream anterior si existe

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

  // --- Lógica de Foto ---
  triggerSnapshot(): void {
    this.cameraTrigger.next();
  }

  /**
   * 🆕 (MODIFICADO) Solo captura la imagen, NO la sube.
   */
  handleImageCapture(webcamImage: WebcamImage): void {
    // Solo guarda la previsualización.
    this.capturedImagePreview.set(webcamImage.imageAsDataUrl);
  }

  // --- Lógica de Video ---

  /**
   * 🆕 (MODIFICADO) Configura onstop para guardar el Blob y la URL de preview.
   */
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
      // ⬇️ LÓGICA DE PREVISUALIZACIÓN ⬇️
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.capturedVideoBlob = blob; // Guardar el blob
      this.capturedVideoPreviewUrl.set(URL.createObjectURL(blob)); // Guardar la URL para <video>

      this.stopMediaStream(); // Apagar la luz de la cámara
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

  // --- 🆕 NUEVOS MÉTODOS DE CONFIRMACIÓN ---

  /**
   * 🆕 (NUEVO) Confirma la captura, convierte a File, sube y cierra.
   */
  confirmCapture(): void {
    let file: File | null = null;
    const targetType = this.cameraTargetType();
    if (!targetType) return;

    if (this.capturedImagePreview()) {
      // Es una foto, convertir base64 a File
      file = this.convertBase64ToFile(this.capturedImagePreview()!, `captura-${Date.now()}.jpg`);
    } else if (this.capturedVideoBlob) {
      // Es un video, usar el Blob guardado
      file = new File([this.capturedVideoBlob], `grabacion-${Date.now()}.webm`, { type: 'video/webm' });
    }

    if (file) {
      this.store.uploadFile(file, targetType as any).then(
        success => {
          if (success) {
            this.store.loadEvidenceFiles();
          }
        }
      )
    }
    this.closeCameraModal();
  }

  /**
   * 🆕 (NUEVO) Descarta la captura y vuelve a la cámara en vivo.
   */
  discardCapture(): void {
    // Limpiar previsualizaciones
    this.capturedImagePreview.set(null);
    if (this.capturedVideoPreviewUrl()) {
      URL.revokeObjectURL(this.capturedVideoPreviewUrl()!);
    }
    this.capturedVideoPreviewUrl.set(null);
    this.capturedVideoBlob = null;

    // Si era un video, reiniciar el stream para volver a la cámara en vivo
    if (!this.isPhotoCapture()) {
      this.initializeVideoStream();
    }
  }
}

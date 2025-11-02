import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { EvidenceFile } from '../../model/interfaces/evidence-file.interface';
import { FileEntity } from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-video-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './video-uploader.component.html',
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse-ring {
      0% {
        transform: scale(0.95);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.7;
      }
      100% {
        transform: scale(0.95);
        opacity: 1;
      }
    }

    .recording-indicator {
      animation: pulse-ring 1.5s ease-in-out infinite;
    }

    .video-item {
      animation: slideIn 0.3s ease-out both;
    }
  `]
})
export class VideoUploaderComponent {
  @Input() label: string = 'Video';
  @Input() file: EvidenceFile | null = null;
  @Input() isLoading: boolean = false;
  @Input() uploadType!: 'videoStart' | 'videoEnd';

  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<void>();
  @Output() onPreview = new EventEmitter<FileEntity>();
  @Output() onOpenCamera = new EventEmitter<string>();
  @Output() onError = new EventEmitter<string>(); // 🆕 Nuevo

  // Estados
  readonly isDragging = signal(false);
  readonly isDeleting = signal(false);
  readonly localPreview = signal<{ url: string; file: File } | null>(null);

  // Constantes
  readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB para videos
  readonly ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  readonly MAX_DURATION_SECONDS = 180; // 3 minutos máximo

  get canShowUpload(): boolean {
    return !this.file;
  }

  get helperText(): string {
    if (this.uploadType === 'videoStart') {
      return '🎥 Graba el estado inicial del equipo y su entorno';
    }
    if (this.uploadType === 'videoEnd') {
      return '✅ Documenta el estado final después del servicio completado';
    }
    return '';
  }

  get uploadButtonLabel(): string {
    return this.uploadType === 'videoStart' ? 'Video de Inicio' : 'Video de Fin';
  }

  // Computed para duración estimada
  readonly videoDuration = computed(() => {
    const fileEntity = this.file?.fileEntity;
    if (!fileEntity) return null;

    // Aquí podrías calcular la duración real si la guardas en metadata
    // Por ahora retornamos null
    return null;
  });

  // ==================== FILE SELECTION ====================

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!this.validateFile(file)) {
      input.value = '';
      return;
    }

    this.createPreview(file);
    input.value = '';
  }

  private validateFile(file: File): boolean {
    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.onError.emit(`Tipo de video no permitido. Formatos aceptados: MP4, WebM, MOV`);
      return false;
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      this.onError.emit(`Video muy grande. Máximo: ${this.formatSize(this.MAX_FILE_SIZE)}`);
      return false;
    }

    // Validar duración (opcional, requiere cargar el video)
    this.validateDuration(file);

    return true;
  }

  private async validateDuration(file: File): Promise<void> {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      if (video.duration > this.MAX_DURATION_SECONDS) {
        this.onError.emit(`Video muy largo. Máximo: ${this.MAX_DURATION_SECONDS / 60} minutos`);
        this.localPreview.set(null);
      }
    };

    video.src = URL.createObjectURL(file);
  }

  private createPreview(file: File): void {
    const url = URL.createObjectURL(file);
    this.localPreview.set({ url, file });
  }

  confirmUpload(): void {
    const preview = this.localPreview();
    if (preview) {
      this.onUpload.emit(preview.file);
      this.cancelUpload();
    }
  }

  cancelUpload(): void {
    const preview = this.localPreview();
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    this.localPreview.set(null);
  }

  // ==================== DRAG & DROP ====================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (this.validateFile(file)) {
      this.createPreview(file);
    }
  }

  // ==================== ACTIONS ====================

  preview(): void {
    if (this.file) {
      this.onPreview.emit(this.file.fileEntity);
    }
  }

  async remove(): Promise<void> {
    this.isDeleting.set(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    this.onRemove.emit();
    this.isDeleting.set(false);
  }

  openCamera(): void {
    this.onOpenCamera.emit(this.uploadType);
  }

  // ==================== HELPERS ====================

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getVideoTypeLabel(contentType: string): string {
    const types: Record<string, string> = {
      'video/mp4': 'MP4',
      'video/webm': 'WebM',
      'video/quicktime': 'MOV',
      'video/x-msvideo': 'AVI'
    };
    return types[contentType] || 'Video';
  }
}

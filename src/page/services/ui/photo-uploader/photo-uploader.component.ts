import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { EvidenceFile } from '../../model/interfaces/evidence-file.interface';
import { FileEntity } from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './photo-uploader.component.html',
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

    .file-item {
      animation: slideIn 0.3s ease-out both;
    }
  `]
})
export class PhotoUploaderComponent {
  @Input() label: string = 'Fotos';
  @Input() files: EvidenceFile[] = [];
  @Input() isLoading: boolean = false;
  @Input() maxFiles: number = 3;
  @Input() uploadType!: 'startPhoto' | 'midPhoto' | 'endPhoto';

  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<string>();
  @Output() onPreview = new EventEmitter<FileEntity>();
  @Output() onOpenCamera = new EventEmitter<string>();
  @Output() onError = new EventEmitter<string>(); // 🆕 Nuevo

  // Estados
  readonly isDragging = signal(false);
  readonly deletingFileId = signal<string | null>(null);
  readonly localPreview = signal<string | null>(null);
  private pendingFile: File | null = null;

  // Constantes
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  get canShowUpload(): boolean {
    return this.files.length < this.maxFiles;
  }

  get helperText(): string {
    if (this.uploadType === 'startPhoto') {
      return '📸 Captura el estado inicial del equipo antes de comenzar';
    }
    if (this.uploadType === 'midPhoto') {
      return '🔧 Documenta el proceso de trabajo realizado';
    }
    if (this.uploadType === 'endPhoto') {
      return '✅ Muestra el estado final después del servicio';
    }
    return '';
  }

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
    this.pendingFile = file;
    input.value = '';
  }

  private validateFile(file: File): boolean {
    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.onError.emit(`Tipo de archivo no permitido. Solo: ${this.ALLOWED_TYPES.join(', ')}`);
      return false;
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      this.onError.emit(`Archivo muy grande. Máximo: ${this.formatSize(this.MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.localPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  confirmUpload(): void {
    if (this.pendingFile) {
      this.onUpload.emit(this.pendingFile);
      this.cancelUpload();
    }
  }

  cancelUpload(): void {
    this.localPreview.set(null);
    this.pendingFile = null;
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

    for (let i = 0; i < files.length; i++) {
      if (this.files.length + i < this.maxFiles) {
        const file = files[i];
        if (this.validateFile(file)) {
          this.onUpload.emit(file);
        }
      }
    }
  }

  // ==================== ACTIONS ====================

  preview(file: FileEntity): void {
    this.onPreview.emit(file);
  }

  async remove(fileId: string): Promise<void> {
    this.deletingFileId.set(fileId);
    await new Promise(resolve => setTimeout(resolve, 300));
    this.onRemove.emit(fileId);
    this.deletingFileId.set(null);
  }

  // ==================== HELPERS ====================

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

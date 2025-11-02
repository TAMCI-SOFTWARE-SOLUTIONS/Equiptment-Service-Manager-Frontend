import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { EvidenceFile } from '../../model/interfaces/evidence-file.interface';
import { FileEntity } from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-report-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './report-uploader.component.html',
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

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .report-item {
      animation: slideIn 0.4s ease-out both;
    }

    .optional-badge {
      animation: fadeIn 0.3s ease-out;
    }

    .pdf-icon-glow {
      filter: drop-shadow(0 2px 8px rgba(239, 68, 68, 0.2));
    }
  `]
})
export class ReportUploaderComponent {
  @Input() label: string = 'Reporte PDF';
  @Input() file: EvidenceFile | null = null;
  @Input() isLoading: boolean = false;
  @Input() uploadType!: 'report';

  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<void>();
  @Output() onPreview = new EventEmitter<FileEntity>();
  @Output() onError = new EventEmitter<string>(); // 🆕 Nuevo

  // Estados
  readonly isDragging = signal(false);
  readonly isDeleting = signal(false);
  readonly localPreview = signal<{ name: string; size: number; file: File } | null>(null);

  // Constantes
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB para PDFs
  readonly ALLOWED_TYPE = 'application/pdf';

  get canShowUpload(): boolean {
    return !this.file;
  }

  get helperText(): string {
    return '📋 Documento opcional con detalles adicionales del servicio realizado';
  }

  // Computed para información del PDF
  readonly pdfInfo = computed(() => {
    const fileEntity = this.file?.fileEntity;
    if (!fileEntity) return null;

    return {
      name: fileEntity.originalName,
      size: fileEntity.size,
      uploadedAt: fileEntity.uploadDate // Si tienes esta info
    };
  });

  readonly pageCount = computed(() => {
    // Aquí podrías extraer el número de páginas si lo guardas en metadata
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
    if (file.type !== this.ALLOWED_TYPE) {
      this.onError.emit('Solo se permiten archivos PDF');
      return false;
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      this.onError.emit(`Archivo muy grande. Máximo: ${this.formatSize(this.MAX_FILE_SIZE)}`);
      return false;
    }

    // Validar que el PDF no esté corrupto (básico)
    if (!this.validatePdfSignature(file)) {
      this.onError.emit('El archivo PDF parece estar corrupto o dañado');
      return false;
    }

    return true;
  }

  private async validatePdfSignature(file: File): Promise<boolean> {
    // Leer los primeros 5 bytes para verificar que sea un PDF válido
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);
        const header = String.fromCharCode(...arr.slice(0, 5));
        resolve(header === '%PDF-');
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 5));
    });
  }

  private createPreview(file: File): void {
    this.localPreview.set({
      name: file.name,
      size: file.size,
      file
    });
  }

  confirmUpload(): void {
    const preview = this.localPreview();
    if (preview) {
      this.onUpload.emit(preview.file);
      this.cancelUpload();
    }
  }

  cancelUpload(): void {
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

  // ==================== HELPERS ====================

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || 'PDF';
  }
}

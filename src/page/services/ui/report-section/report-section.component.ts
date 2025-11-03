import { Component, input, output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileService} from '../../../../entities/file/api/file.service';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {EquipmentServiceEntity} from '../../../../entities/equipment-service';
import {
  canEditReport,
  getDaysRemainingToEdit,
  getReportStatusMessage,
  shouldShowExpiredMessage
} from '../../utils/report-edit.helpers';

@Component({
  selector: 'app-report-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <i class="pi pi-file-pdf text-2xl text-red-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Reporte PDF</h3>
            <p class="text-xs text-gray-600">{{ getStatusMessage() }}</p>
          </div>
        </div>

        <!-- Status Badge -->
        @if (reportFile()) {
          <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20">
            <i class="pi pi-check-circle mr-1"></i>
            Cargado
          </span>
        } @else if (showExpiredMessage()) {
          <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-600/20">
            <i class="pi pi-clock mr-1"></i>
            Plazo vencido
          </span>
        } @else if (isEditable()) {
          <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
            <i class="pi pi-hourglass mr-1"></i>
            {{ daysRemaining() }} día(s)
          </span>
        }
      </div>

      <!-- Report Content -->
      <div class="mt-4">
        @if (reportFile()) {
          <!-- Tiene reporte -->
          <div class="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <i class="pi pi-file-pdf text-3xl text-red-600"></i>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-gray-900">{{ reportFile()!.originalName }}</p>
              <p class="text-xs text-gray-600">{{ formatFileSize(reportFile()!.size) }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button
                (click)="handlePreview()"
                [disabled]="isLoadingPreview()"
                class="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <i class="pi" [class.pi-eye]="!isLoadingPreview()" [class.pi-spin]="isLoadingPreview()" [class.pi-spinner]="isLoadingPreview()"></i>
                <span>{{ isLoadingPreview() ? 'Cargando...' : 'Ver' }}</span>
              </button>

              <button
                (click)="handleDownload()"
                [disabled]="isDownloading()"
                class="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <i class="pi" [class.pi-download]="!isDownloading()" [class.pi-spin]="isDownloading()" [class.pi-spinner]="isDownloading()"></i>
                <span>{{ isDownloading() ? 'Descargando...' : 'Descargar' }}</span>
              </button>

              @if (isEditable()) {
                <button
                  (click)="onRemove.emit()"
                  [disabled]="isUploading()"
                  class="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
                  <i class="pi pi-trash"></i>
                  <span>Eliminar</span>
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- No tiene reporte -->
          <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            @if (isEditable()) {
              <!-- Puede subir -->
              <i class="pi pi-cloud-upload text-5xl text-gray-300"></i>
              <p class="mt-3 font-semibold text-gray-900">No hay reporte cargado</p>
              <p class="mt-1 text-sm text-gray-600">
                Puedes agregar un reporte PDF. Quedan {{ daysRemaining() }} día(s).
              </p>

              <label class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                     [class.opacity-50]="isUploading()"
                     [class.cursor-not-allowed]="isUploading()">
                <i class="pi" [class.pi-upload]="!isUploading()" [class.pi-spin]="isUploading()" [class.pi-spinner]="isUploading()"></i>
                <span>{{ isUploading() ? 'Subiendo...' : 'Subir Reporte' }}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  class="hidden"
                  [disabled]="isUploading()"
                  (change)="onFileSelected($event)">
              </label>
            } @else if (showExpiredMessage()) {
              <!-- Plazo vencido -->
              <i class="pi pi-lock text-5xl text-gray-300"></i>
              <p class="mt-3 font-semibold text-gray-900">Plazo vencido</p>
              <p class="mt-1 text-sm text-gray-600">
                El período para cargar el reporte ha expirado.
              </p>
            } @else {
              <!-- No disponible (otros estados) -->
              <i class="pi pi-file-pdf text-5xl text-gray-300"></i>
              <p class="mt-3 font-semibold text-gray-900">Reporte no disponible</p>
              <p class="mt-1 text-sm text-gray-600">
                No se cargó ningún reporte para este servicio.
              </p>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class ReportSectionComponent {
  private readonly fileService = inject(FileService);

  // Inputs
  readonly service = input.required<EquipmentServiceEntity>();
  readonly reportFile = input<FileEntity | null>(null);
  readonly userRole = input.required<string>();
  readonly isUploading = input<boolean>(false);

  // Outputs
  readonly onUpload = output<File>();
  readonly onRemove = output<void>();

  // Signals internos
  readonly isLoadingPreview = signal(false);
  readonly isDownloading = signal(false);

  // Computed
  readonly isEditable = computed(() => {
    return canEditReport(this.service(), this.userRole());
  });

  readonly daysRemaining = computed(() => {
    return getDaysRemainingToEdit(this.service());
  });

  readonly showExpiredMessage = computed(() => {
    return shouldShowExpiredMessage(this.service());
  });

  getStatusMessage(): string {
    return getReportStatusMessage(this.service());
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tipo
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        input.value = '';
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        input.value = '';
        return;
      }

      this.onUpload.emit(file);
      input.value = ''; // Reset input
    }
  }

  handlePreview(): void {
    const file = this.reportFile();
    if (!file) return;

    this.isLoadingPreview.set(true);
    this.fileService.viewFileAsUrl(file.id).subscribe({
      next: (url) => {
        window.open(url, '_blank');
        this.isLoadingPreview.set(false);
      },
      error: (error) => {
        console.error('❌ Error previewing PDF:', error);
        this.isLoadingPreview.set(false);
        alert('Error al abrir el PDF. Por favor, intenta descargarlo.');
      }
    });
  }

  handleDownload(): void {
    const file = this.reportFile();
    if (!file) return;

    this.isDownloading.set(true);
    this.fileService.downloadAndSaveFile(file.id, file.originalName).subscribe({
      next: () => {
        this.isDownloading.set(false);
      },
      error: (error) => {
        console.error('❌ Error downloading PDF:', error);
        this.isDownloading.set(false);
        alert('Error al descargar el PDF');
      }
    });
  }
}

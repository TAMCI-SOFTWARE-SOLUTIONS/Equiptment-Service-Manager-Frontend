import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileService} from '../../../../entities/file/api/file.service';
import {FileEntity} from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-video-preview-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (file()) {
      <div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">

        <!-- Video Thumbnail/Preview -->
        <div class="relative aspect-video bg-gray-900">
          @if (isLoadingUrl()) {
            <!-- Loading state -->
            <div class="flex h-full items-center justify-center">
              <i class="pi pi-spin pi-spinner text-4xl text-white"></i>
            </div>
          } @else if (videoUrl()) {
            <video
              [src]="videoUrl()!"
              class="h-full w-full object-cover"
              preload="metadata">
            </video>
          } @else {
            <div class="flex h-full items-center justify-center">
              <i class="pi pi-video text-6xl text-gray-600"></i>
            </div>
          }

          <!-- Play Overlay -->
          @if (!isLoadingUrl()) {
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                (click)="onPreview.emit()"
                class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-110">
                <i class="pi pi-play text-2xl text-gray-900"></i>
              </button>
            </div>
          }
        </div>

        <!-- Info -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-gray-900">{{ label() }}</p>
              <p class="mt-1 text-xs text-gray-600">{{ file()!.originalName }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ formatFileSize(file()!.size) }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button
                (click)="onPreview.emit()"
                [disabled]="isLoadingUrl()"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Ver video">
                <i class="pi pi-eye text-sm"></i>
              </button>

              <button
                (click)="handleDownload()"
                [disabled]="isDownloading()"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Descargar">
                <i class="pi text-sm" [class.pi-download]="!isDownloading()" [class.pi-spin]="isDownloading()" [class.pi-spinner]="isDownloading()"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    } @else {
      <!-- Empty State -->
      <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8">
        <i class="pi pi-video text-4xl text-gray-300"></i>
        <p class="mt-2 text-sm font-medium text-gray-500">{{ label() }}</p>
        <p class="mt-1 text-xs text-gray-400">No disponible</p>
      </div>
    }
  `
})
export class VideoPreviewCardComponent {
  private readonly fileService = inject(FileService);

  readonly label = input.required<string>();
  readonly file = input<FileEntity | null>(null);

  readonly onPreview = output<void>();

  // Signals internos
  readonly videoUrl = signal<string | null>(null);
  readonly isLoadingUrl = signal(false);
  readonly isDownloading = signal(false);

  constructor() {
    // Effect para cargar URL cuando cambia el file
    effect(() => {
      const fileEntity = this.file();
      if (fileEntity) {
        this.loadVideoUrl(fileEntity.id);
      } else {
        this.videoUrl.set(null);
      }
    });
  }

  private loadVideoUrl(fileId: string): void {
    this.isLoadingUrl.set(true);
    this.fileService.viewFileAsUrl(fileId).subscribe({
      next: (url) => {
        this.videoUrl.set(url);
        this.isLoadingUrl.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading video URL:', error);
        this.videoUrl.set(null);
        this.isLoadingUrl.set(false);
      }
    });
  }

  handleDownload(): void {
    const fileEntity = this.file();
    if (!fileEntity) return;

    this.isDownloading.set(true);
    this.fileService.downloadAndSaveFile(fileEntity.id, fileEntity.originalName).subscribe({
      next: () => {
        this.isDownloading.set(false);
      },
      error: (error) => {
        console.error('❌ Error downloading video:', error);
        this.isDownloading.set(false);
        alert('Error al descargar el video');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

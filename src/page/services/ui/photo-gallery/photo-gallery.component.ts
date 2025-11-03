import { Component, input, output, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {FileService} from '../../../../entities/file/api/file.service';

interface PhotoWithUrl extends FileEntity {
  url?: string;
  isLoadingUrl?: boolean;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (photos().length > 0) {
      <div>
        <p class="mb-3 text-sm font-semibold text-gray-900">{{ label() }}</p>
        <div class="grid grid-cols-3 gap-3">
          @for (photo of photosWithUrls(); track photo.id) {
            <button
              (click)="onPhotoClick.emit(photo)"
              [disabled]="photo.isLoadingUrl"
              class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-all hover:shadow-lg disabled:cursor-wait">

              @if (photo.isLoadingUrl) {
                <!-- Loading -->
                <div class="flex h-full items-center justify-center">
                  <i class="pi pi-spin pi-spinner text-3xl text-gray-400"></i>
                </div>
              } @else if (photo.url) {
                <!-- Image -->
                <img
                  [src]="photo.url"
                  [alt]="photo.originalName"
                  class="h-full w-full object-cover transition-transform group-hover:scale-110">

                <!-- Overlay -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <i class="pi pi-search-plus text-2xl text-white"></i>
                </div>
              } @else {
                <!-- Error state -->
                <div class="flex h-full items-center justify-center">
                  <i class="pi pi-image text-4xl text-gray-300"></i>
                </div>
              }

            </button>
          }
        </div>
      </div>
    } @else {
      <!-- Empty State -->
      <div>
        <p class="mb-3 text-sm font-semibold text-gray-900">{{ label() }}</p>
        <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8">
          <i class="pi pi-images text-4xl text-gray-300"></i>
          <p class="mt-2 text-sm text-gray-500">No hay fotos disponibles</p>
        </div>
      </div>
    }
  `
})
export class PhotoGalleryComponent {
  private readonly fileService = inject(FileService);

  readonly label = input.required<string>();
  readonly photos = input.required<FileEntity[]>();

  readonly onPhotoClick = output<FileEntity>();

  // Computed con URLs cargadas
  readonly photosWithUrls = computed<PhotoWithUrl[]>(() => {
    return this.photos().map(photo => ({
      ...photo,
      url: undefined,
      isLoadingUrl: false
    }));
  });

  constructor() {
    // Effect para cargar URLs cuando cambian las fotos
    effect(() => {
      const photos = this.photos();
      photos.forEach(photo => {
        this.loadPhotoUrl(photo.id);
      });
    });
  }

  private loadPhotoUrl(fileId: string): void {
    const photoList = this.photosWithUrls();
    const photo = photoList.find(p => p.id === fileId);
    if (!photo || photo.url || photo.isLoadingUrl) return;

    photo.isLoadingUrl = true;

    this.fileService.viewFileAsUrl(fileId).subscribe({
      next: (url) => {
        photo.url = url;
        photo.isLoadingUrl = false;
      },
      error: (error) => {
        console.error(`❌ Error loading photo URL for ${fileId}:`, error);
        photo.isLoadingUrl = false;
      }
    });
  }
}

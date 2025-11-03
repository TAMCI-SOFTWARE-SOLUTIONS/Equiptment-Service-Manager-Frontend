import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPreviewCardComponent } from '../video-preview-card/video-preview-card.component';
import { PhotoGalleryComponent } from '../photo-gallery/photo-gallery.component';
import { ReportSectionComponent } from '../report-section/report-section.component';
import {EquipmentServiceEntity} from '../../../../entities/equipment-service';
import {FileEntity} from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-evidence-accordion',
  standalone: true,
  imports: [
    CommonModule,
    VideoPreviewCardComponent,
    PhotoGalleryComponent,
    ReportSectionComponent
  ],
  template: `
    <div class="space-y-4">

      <!-- Videos Section -->
      <div class="rounded-xl border border-gray-200 bg-white">

        <!-- Accordion Header -->
        <button
          (click)="toggleVideos()"
          class="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-gray-50">

          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <i class="pi pi-video text-lg text-purple-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Videos del Servicio</p>
              <p class="text-xs text-gray-600">
                {{ getVideosCount() }} video(s) disponible(s)
              </p>
            </div>
          </div>

          <i class="pi text-gray-400 transition-transform duration-200"
             [class.pi-chevron-down]="!showVideos()"
             [class.pi-chevron-up]="showVideos()"></i>
        </button>

        <!-- Accordion Content -->
        @if (showVideos()) {
          <div class="border-t border-gray-200 p-5">
            <div class="grid gap-6 md:grid-cols-2">

              <!-- Video Inicio -->
              <app-video-preview-card
                label="Video de Inicio"
                [file]="evidenceFiles().videoStart"
                (onPreview)="onVideoPreview.emit(evidenceFiles().videoStart!)">
              </app-video-preview-card>

              <!-- Video Fin -->
              <app-video-preview-card
                label="Video de Fin"
                [file]="evidenceFiles().videoEnd"
                (onPreview)="onVideoPreview.emit(evidenceFiles().videoEnd!)">
              </app-video-preview-card>

            </div>
          </div>
        }

      </div>

      <!-- Photos Section -->
      <div class="rounded-xl border border-gray-200 bg-white">

        <!-- Accordion Header -->
        <button
          (click)="togglePhotos()"
          class="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-gray-50">

          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <i class="pi pi-images text-lg text-sky-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Reporte Fotográfico</p>
              <p class="text-xs text-gray-600">
                {{ getPhotosCount() }} foto(s) disponible(s)
              </p>
            </div>
          </div>

          <i class="pi text-gray-400 transition-transform duration-200"
             [class.pi-chevron-down]="!showPhotos()"
             [class.pi-chevron-up]="showPhotos()"></i>
        </button>

        <!-- Accordion Content -->
        @if (showPhotos()) {
          <div class="border-t border-gray-200 p-5">
            <div class="space-y-6">

              <!-- Fotos de Inicio -->
              <app-photo-gallery
                label="Fotos de Inicio"
                [photos]="evidenceFiles().startPhotos"
                (onPhotoClick)="onPhotoClick.emit($event)">
              </app-photo-gallery>

              <!-- Fotos de Proceso -->
              <app-photo-gallery
                label="Fotos de Proceso"
                [photos]="evidenceFiles().midPhotos"
                (onPhotoClick)="onPhotoClick.emit($event)">
              </app-photo-gallery>

              <!-- Fotos de Fin -->
              <app-photo-gallery
                label="Fotos de Fin"
                [photos]="evidenceFiles().endPhotos"
                (onPhotoClick)="onPhotoClick.emit($event)">
              </app-photo-gallery>

            </div>
          </div>
        }

      </div>

      <!-- Report Section -->
      <app-report-section
        [service]="service()"
        [reportFile]="evidenceFiles().report"
        [userRole]="userRole()"
        [isUploading]="isUploadingReport()"
        (onUpload)="onReportUpload.emit($event)"
        (onRemove)="onReportRemove.emit()">
      </app-report-section>

    </div>
  `
})
export class EvidenceAccordionComponent {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly evidenceFiles = input.required<{
    videoStart: FileEntity | null;
    videoEnd: FileEntity | null;
    startPhotos: FileEntity[];
    midPhotos: FileEntity[];
    endPhotos: FileEntity[];
    report: FileEntity | null;
  }>();
  readonly userRole = input.required<string>();
  readonly isUploadingReport = input<boolean>(false);

  readonly onVideoPreview = output<FileEntity>();
  readonly onPhotoClick = output<FileEntity>();
  readonly onReportUpload = output<File>();
  readonly onReportRemove = output<void>();

  // Signals para controlar accordions
  readonly showVideos = signal(true);
  readonly showPhotos = signal(true);

  toggleVideos(): void {
    this.showVideos.set(!this.showVideos());
  }

  togglePhotos(): void {
    this.showPhotos.set(!this.showPhotos());
  }

  getVideosCount(): number {
    const files = this.evidenceFiles();
    let count = 0;
    if (files.videoStart) count++;
    if (files.videoEnd) count++;
    return count;
  }

  getPhotosCount(): number {
    const files = this.evidenceFiles();
    return files.startPhotos.length + files.midPhotos.length + files.endPhotos.length;
  }
}

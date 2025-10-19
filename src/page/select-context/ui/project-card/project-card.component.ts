import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectEntity } from '../../../../entities/project/model/project.entity';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { FileService } from '../../../../entities/file/api/file.service';
import { RippleModule } from 'primeng/ripple';
import {ProjectStatusEnum} from '../../../../entities/project/model/project-status.enum';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RippleModule],
  template: `
    <button
      pRipple
      type="button"
      (click)="cardClick.emit(project())"
      class="group w-full overflow-hidden rounded-xl border-2 bg-white text-left transition-all duration-300 hover:shadow-lg"
      [ngClass]="{
        'border-sky-500 shadow-md': isSelected(),
        'border-gray-200 hover:border-sky-300': !isSelected()
      }">

      <!-- Banner Image -->
      <div class="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        @if (bannerUrl()) {
          <img
            [src]="bannerUrl()!"
            [alt]="project().name"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        } @else {
          <!-- Default gradient -->
          <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400 to-cyan-500">
            <i class="pi pi-folder text-5xl text-white opacity-20"></i>
          </div>
        }

        <!-- Selected Badge (overlay) -->
        @if (isSelected()) {
          <div class="absolute right-3 top-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 shadow-xl ring-4 ring-white">
              <i class="pi pi-check text-sm font-bold text-white"></i>
            </div>
          </div>
        }
      </div>

      <!-- Content -->
      <div class="p-5">
        <!-- Project Name -->
        <h3 class="mb-1.5 text-lg font-semibold text-gray-900 transition-colors duration-200 line-clamp-2"
            [ngClass]="{'text-sky-600': isSelected()}">
          {{ project().name }}
        </h3>

        <!-- Project Code -->
        <p class="mb-4 font-mono text-sm text-gray-500">
          {{ project().code }}
        </p>

        <!-- Badges Row -->
        <div class="mb-4 flex flex-wrap gap-2">
          <!-- Status Badge -->
          <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200"
                [ngClass]="getStatusBadgeClasses()">
            {{ getStatusLabel() }}
          </span>

          <!-- Equipment Type Badges -->
          @for (type of project().allowedEquipmentTypes; track type) {
            <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200"
                  [ngClass]="getEquipmentBadgeClasses(type)">
              <span>{{ getEquipmentIcon(type) }}</span>
              <span>{{ getEquipmentLabel(type) }}</span>
            </span>
          }
        </div>

        <!-- Description (Expandable) -->
        @if (project().description) {
          <div>
            <div class="overflow-hidden text-sm text-gray-600 transition-all duration-300"
                 [class.line-clamp-2]="!isDescriptionExpanded()"
                 [class.line-clamp-none]="isDescriptionExpanded()">
              <p>{{ project().description }}</p>
            </div>

            <!-- Toggle Button -->
            @if (project().description.length > 100) {
              <button
                type="button"
                (click)="toggleDescription($event)"
                class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700">
                <span>{{ isDescriptionExpanded() ? 'Ver menos' : 'Ver más' }}</span>
                <i class="pi text-xs" [ngClass]="isDescriptionExpanded() ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
              </button>
            }
          </div>
        }
      </div>
    </button>
  `
})
export class ProjectCardComponent implements OnInit {
  project = input.required<ProjectEntity>();
  isSelected = input.required<boolean>();
  cardClick = output<ProjectEntity>();

  private fileService = inject(FileService);

  bannerUrl = signal<string | null>(null);
  isDescriptionExpanded = signal(false);

  ngOnInit(): void {
    this.loadBanner();
  }

  private loadBanner(): void {
    const bannerId = this.project().bannerId;
    if (bannerId) {
      this.fileService.viewFileAsUrl(bannerId).subscribe({
        next: (url) => this.bannerUrl.set(url),
        error: (err) => console.error('❌ Error loading project banner:', err)
      });
    }
  }

  toggleDescription(event: Event): void {
    event.stopPropagation();
    this.isDescriptionExpanded.update(val => !val);
  }

  getStatusBadgeClasses(): string {
    const status = this.project().status;
    const baseClasses = 'transition-colors duration-200';

    switch (status) {
      case ProjectStatusEnum.PLANNED:
        return `${baseClasses} bg-gray-100 text-gray-700`;
      case ProjectStatusEnum.IN_PROGRESS:
        return `${baseClasses} bg-sky-100 text-sky-700`;
      case ProjectStatusEnum.COMPLETED:
        return `${baseClasses} bg-emerald-100 text-emerald-700`;
      case ProjectStatusEnum.ON_HOLD:
        return `${baseClasses} bg-amber-100 text-amber-700`;
      case ProjectStatusEnum.CANCELLED:
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  }

  getStatusLabel(): string {
    const status = this.project().status;
    const labels: Record<ProjectStatusEnum, string> = {
      [ProjectStatusEnum.PLANNED]: 'Planificado',
      [ProjectStatusEnum.IN_PROGRESS]: 'En Progreso',
      [ProjectStatusEnum.COMPLETED]: 'Completado',
      [ProjectStatusEnum.ON_HOLD]: 'En Espera',
      [ProjectStatusEnum.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getEquipmentBadgeClasses(type: EquipmentTypeEnum): string {
    const baseClasses = 'transition-colors duration-200';

    switch (type) {
      case EquipmentTypeEnum.CABINET:
        return `${baseClasses} bg-indigo-100 text-indigo-700`;
      case EquipmentTypeEnum.PANEL:
        return `${baseClasses} bg-purple-100 text-purple-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  }

  getEquipmentIcon(type: EquipmentTypeEnum): string {
    switch (type) {
      case EquipmentTypeEnum.CABINET:
        return '🗄️';
      case EquipmentTypeEnum.PANEL:
        return '📋';
      default:
        return '📦';
    }
  }

  getEquipmentLabel(type: EquipmentTypeEnum): string {
    const labels: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'Gabinete',
      [EquipmentTypeEnum.PANEL]: 'Tablero'
    };
    return labels[type] || type;
  }
}

import {Component, effect, inject, input, output, signal} from '@angular/core';
import {ProjectEntity} from '../../model/project.entity';
import {FileCacheService} from '../../../../shared/api/services/file-cache.service';
import {DateUtils} from '../../../../shared/utils/DateUtils';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {getEquipmentTypeIcon, getEquipmentTypeLabel} from '../../../../shared/model/enums/equipment-type.enum';
import {RippleModule} from 'primeng/ripple';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-project-card',
  imports: [CommonModule, RippleModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  readonly project = input.required<ProjectEntity>();
  readonly isSelected = input<boolean>(false);
  readonly clickable = input<boolean>(true);

  readonly cardClick = output<ProjectEntity>();

  private readonly fileCache = inject(FileCacheService);

  readonly bannerUrl = signal<string | null>(null);
  readonly isDescriptionExpanded = signal<boolean>(false);

  constructor() {
    effect(async () => {
      const project = this.project();

      if (project.bannerId) {
        const url = await this.fileCache.getFileUrl(project.bannerId);
        this.bannerUrl.set(url);
      } else {
        this.bannerUrl.set(null);
      }
    });
  }

  handleCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.project());
    }
  }

  toggleDescription(event: Event): void {
    event.stopPropagation();
    this.isDescriptionExpanded.update(value => !value);
  }

  formatDate(date: Date | null): string {
    return DateUtils.formatDateShort(date);
  }

  getEquipmentLabel(type: EquipmentTypeEnum): string {
    return getEquipmentTypeLabel(type);
  }

  getEquipmentIcon(type: EquipmentTypeEnum): string {
    return getEquipmentTypeIcon(type);
  }
}

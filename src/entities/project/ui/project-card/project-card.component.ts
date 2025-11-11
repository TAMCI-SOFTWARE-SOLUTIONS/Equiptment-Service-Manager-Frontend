import { Component, effect, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ProjectEntity } from '../../model/project.entity';
import { FileCacheService } from '../../../../shared/api/services/file-cache.service';
import { DateUtils } from '../../../../shared/utils/DateUtils';
import {
  EquipmentTypeEnum,
  getEquipmentTypeIcon,
  getEquipmentTypeLabel
} from '../../../../shared/model/enums/equipment-type.enum';
import {EntityIconComponent} from '../../../../shared/ui/entity-icon/entity-icon.component';
import {CardSize} from '../../../client/model/card-config.enum';
import {IconEntity} from '../../../../shared/model/enums/icon-entity.enum';
import {IconSize} from '../../../../shared/model/enums/icon-size.enum';
import {IconRounded} from '../../../../shared/model/enums/icon.rounded';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RippleModule, EntityIconComponent],
  templateUrl: './project-card.component.html'
})
export class ProjectCardComponent {
  readonly project = input.required<ProjectEntity>();
  readonly isSelected = input<boolean>(false);
  readonly clickable = input<boolean>(true);
  readonly nameClickable = input<boolean>(false);
  readonly size = input<CardSize>(CardSize.MD);
  readonly showBanner = input<boolean>(true);
  readonly showCheckmark = input<boolean>(true);
  readonly showMetadata = input<boolean>(true);
  readonly showArrow = input<boolean>(true);
  readonly showEquipmentTypes = input<boolean>(true);
  readonly showDates = input<boolean>(true);
  readonly showDescription = input<boolean>(true);

  readonly cardClick = output<ProjectEntity>();
  readonly nameClick = output<ProjectEntity>();

  private readonly fileCache = inject(FileCacheService);

  readonly bannerUrl = signal<string | null>(null);
  readonly isDescriptionExpanded = signal<boolean>(false);

  readonly CardSize = CardSize;
  readonly IconEntity = IconEntity;
  readonly IconSize = IconSize;
  readonly IconRounded = IconRounded;

  readonly containerHeight = computed(() => {
    if (!this.showBanner()) {
      return 'h-auto';
    }

    const heights: Record<CardSize, string> = {
      [CardSize.SM]: 'h-32',
      [CardSize.MD]: 'h-40',
      [CardSize.LG]: 'h-48',
      [CardSize.XL]: 'h-56'
    };
    return heights[this.size()];
  });

  readonly nameTextSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'text-base sm:text-lg',
      [CardSize.MD]: 'text-lg sm:text-xl',
      [CardSize.LG]: 'text-xl sm:text-2xl',
      [CardSize.XL]: 'text-2xl sm:text-3xl'
    };
    return sizes[this.size()];
  });

  readonly codeTextSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'text-xs',
      [CardSize.MD]: 'text-sm',
      [CardSize.LG]: 'text-sm',
      [CardSize.XL]: 'text-base'
    };
    return sizes[this.size()];
  });

  readonly metadataTextSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'text-[10px]',
      [CardSize.MD]: 'text-xs',
      [CardSize.LG]: 'text-xs',
      [CardSize.XL]: 'text-sm'
    };
    return sizes[this.size()];
  });

  readonly padding = computed(() => {
    const paddings: Record<CardSize, string> = {
      [CardSize.SM]: 'p-3 sm:p-4',
      [CardSize.MD]: 'p-4 sm:p-5',
      [CardSize.LG]: 'p-5 sm:p-6',
      [CardSize.XL]: 'p-6 sm:p-8'
    };
    return paddings[this.size()];
  });

  readonly checkmarkSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'h-7 w-7',
      [CardSize.MD]: 'h-8 w-8 sm:h-9 sm:w-9',
      [CardSize.LG]: 'h-9 w-9 sm:h-10 sm:w-10',
      [CardSize.XL]: 'h-10 w-10 sm:h-12 sm:w-12'
    };
    return sizes[this.size()];
  });

  constructor() {
    effect(async () => {
      const project = this.project();

      if (project.bannerId && this.showBanner()) {
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

  handleNameClick(event: Event): void {
    if (this.nameClickable()) {
      event.stopPropagation();
      this.nameClick.emit(this.project());
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

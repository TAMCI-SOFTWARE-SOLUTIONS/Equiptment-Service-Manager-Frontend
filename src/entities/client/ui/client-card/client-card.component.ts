import {Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RippleModule} from 'primeng/ripple';
import {ClientEntity} from '../../model';
import {FileCacheService} from '../../../../shared/api/services/file-cache.service';
import {CardSize} from '../../model/card-config.enum';
import {IconEntity} from '../../../../shared/model/enums/icon-entity.enum';
import {IconSize} from '../../../../shared/model/enums/icon-size.enum';
import {EntityIconComponent} from '../../../../shared/ui/entity-icon/entity-icon.component';
import {IconRounded} from '../../../../shared/model/enums/icon.rounded';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule, RippleModule, EntityIconComponent],
  templateUrl: './client-card.component.html'
})
export class ClientCardComponent {
  readonly client = input.required<ClientEntity>();
  readonly isSelected = input<boolean>(false);
  readonly clickable = input<boolean>(true);
  readonly nameClickable = input<boolean>(false);
  readonly logoClickable = input<boolean>(false);
  readonly size = input<CardSize>(CardSize.MD);
  readonly showBanner = input<boolean>(true);
  readonly showLogo = input<boolean>(true);
  readonly showCheckmark = input<boolean>(true);
  readonly showMetadata = input<boolean>(true);
  readonly showArrow = input<boolean>(true);

  readonly cardClick = output<ClientEntity>();
  readonly nameClick = output<ClientEntity>();
  readonly logoClick = output<ClientEntity>();

  private readonly fileCache = inject(FileCacheService);

  readonly logoUrl = signal<string | null>(null);
  readonly bannerUrl = signal<string | null>(null);

  readonly IconEntity = IconEntity;
  readonly IconSize = IconSize;

  readonly initials = computed(() => {
    return this.client().name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

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

  readonly logoSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'h-12 w-12',
      [CardSize.MD]: 'h-16 w-16',
      [CardSize.LG]: 'h-20 w-20',
      [CardSize.XL]: 'h-24 w-24'
    };
    return sizes[this.size()];
  });

  readonly logoTextSize = computed(() => {
    const sizes: Record<CardSize, string> = {
      [CardSize.SM]: 'text-lg',
      [CardSize.MD]: 'text-2xl',
      [CardSize.LG]: 'text-3xl',
      [CardSize.XL]: 'text-4xl'
    };
    return sizes[this.size()];
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
      const client = this.client();

      if (client.logoFileId && this.showLogo()) {
        const url = await this.fileCache.getFileUrl(client.logoFileId);
        this.logoUrl.set(url);
      } else {
        this.logoUrl.set(null);
      }

      if (client.bannerFileId && this.showBanner()) {
        const url = await this.fileCache.getFileUrl(client.bannerFileId);
        this.bannerUrl.set(url);
      } else {
        this.bannerUrl.set(null);
      }
    });
  }

  handleCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.client());
    }
  }

  handleNameClick(event: Event): void {
    if (this.nameClickable()) {
      event.stopPropagation();
      this.nameClick.emit(this.client());
    }
  }

  handleLogoClick(event: Event): void {
    if (this.logoClickable()) {
      event.stopPropagation();
      this.logoClick.emit(this.client());
    }
  }

  protected readonly IconRounded = IconRounded;
}

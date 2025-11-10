import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import {ClientEntity} from '../../model';
import {FileCacheService} from '../../../../shared/api/services/file-cache.service';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule, RippleModule],
  templateUrl: './client-card.component.html'
})
export class ClientCardComponent {
  readonly client = input.required<ClientEntity>();
  readonly isSelected = input<boolean>(false);
  readonly clickable = input<boolean>(true);

  readonly cardClick = output<ClientEntity>();

  private readonly fileCache = inject(FileCacheService);

  readonly logoUrl = signal<string | null>(null);
  readonly bannerUrl = signal<string | null>(null);

  readonly initials = computed(() => {
    return this.client().name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  constructor() {
    effect(async () => {
      const client = this.client();

      if (client.logoFileId) {
        const url = await this.fileCache.getFileUrl(client.logoFileId);
        this.logoUrl.set(url);
      } else {
        this.logoUrl.set(null);
      }

      if (client.bannerFileId) {
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
}

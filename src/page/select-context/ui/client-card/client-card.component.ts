import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientEntity } from '../../../../entities/client/model';
import { FileService } from '../../../../entities/file/api/file.service';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule, RippleModule],
  template: `
    <button
      pRipple
      type="button"
      (click)="cardClick.emit(client())"
      class="group relative w-full overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 hover:shadow-lg"
      [ngClass]="{
        'border-sky-500 shadow-md': isSelected(),
        'border-gray-200 hover:border-sky-300': !isSelected()
      }">

      <!-- Banner Background (muy sutil, blur) -->
      @if (bannerUrl()) {
        <div class="absolute inset-0 opacity-5 blur-sm">
          <img [src]="bannerUrl()!" alt="" class="h-full w-full object-cover" />
        </div>
      }

      <!-- Content -->
      <div class="relative p-6">
        <!-- Logo -->
        <div class="mb-4 flex justify-center">
          @if (logoUrl()) {
            <div class="relative">
              <img
                [src]="logoUrl()!"
                [alt]="client().name"
                class="h-24 w-24 rounded-2xl object-cover shadow-md ring-4 ring-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                [ngClass]="{'ring-sky-200': isSelected()}" />

              @if (isSelected()) {
                <div class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 shadow-lg">
                  <i class="pi pi-check text-xs font-bold text-white"></i>
                </div>
              }
            </div>
          } @else {
            <!-- Initials Avatar -->
            <div class="relative">
              <div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-3xl font-bold text-white shadow-md ring-4 ring-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                   [ngClass]="{'ring-sky-200': isSelected()}">
                {{ getInitials() }}
              </div>

              @if (isSelected()) {
                <div class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 shadow-lg">
                  <i class="pi pi-check text-xs font-bold text-white"></i>
                </div>
              }
            </div>
          }
        </div>

        <!-- Client Name -->
        <h3 class="text-center text-lg font-semibold text-gray-900 transition-colors duration-200 line-clamp-2"
            [ngClass]="{'text-sky-600': isSelected()}">
          {{ client().name }}
        </h3>

        <!-- Selected Badge -->
        @if (isSelected()) {
          <div class="mt-3 flex items-center justify-center">
            <div class="flex items-center space-x-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              <i class="pi pi-check-circle text-xs"></i>
              <span>Seleccionado</span>
            </div>
          </div>
        }
      </div>

      <!-- Hover overlay -->
      <div class="absolute inset-0 rounded-xl bg-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           [class.opacity-100]="isSelected()">
      </div>
    </button>
  `
})
export class ClientCardComponent implements OnInit {
  client = input.required<ClientEntity>();
  isSelected = input.required<boolean>();
  cardClick = output<ClientEntity>();

  private fileService = inject(FileService);

  logoUrl = signal<string | null>(null);
  bannerUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLogo();
    this.loadBanner();
  }

  private loadLogo(): void {
    const logoId = this.client().logoFileId;
    if (logoId) {
      this.fileService.viewFileAsUrl(logoId).subscribe({
        next: (url) => this.logoUrl.set(url),
        error: (err) => console.error('❌ Error loading client logo:', err)
      });
    }
  }

  private loadBanner(): void {
    const bannerId = this.client().bannerFileId;
    if (bannerId) {
      this.fileService.viewFileAsUrl(bannerId).subscribe({
        next: (url) => this.bannerUrl.set(url),
        error: (err) => console.error('❌ Error loading client banner:', err)
      });
    }
  }

  getInitials(): string {
    const name = this.client().name || '';
    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }
}

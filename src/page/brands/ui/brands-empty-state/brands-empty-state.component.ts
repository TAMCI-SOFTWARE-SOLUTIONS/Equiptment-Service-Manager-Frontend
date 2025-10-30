import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-brands-empty-state',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <div class="flex min-h-[400px] flex-col items-center justify-center px-4 py-12">
      <!-- Icon -->
      <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100">
        <i class="pi pi-box text-3xl text-sky-600"></i>
      </div>

      <!-- Title -->
      <h3 class="mb-2 text-xl font-semibold text-gray-900">
        No hay marcas registradas
      </h3>

      <!-- Description -->
      <p class="mb-8 max-w-md text-center text-sm text-gray-500">
        Las marcas te permiten categorizar los equipos por fabricante y modelo.
        <br />
        Comienza creando tu primera marca.
      </p>

      <!-- Action Button -->
      <button
        type="button"
        (click)="onCreate()"
        pRipple
        class="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
        <i class="pi pi-plus text-sm"></i>
        <span>Crear primera marca</span>
      </button>
    </div>
  `
})
export class BrandsEmptyStateComponent {
  onCreate(): void {
    const event = new CustomEvent('create-brand', { bubbles: true });
    document.dispatchEvent(event);
  }
}

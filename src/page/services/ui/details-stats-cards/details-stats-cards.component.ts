import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

      <!-- Total Items -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Items</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ totalItems() }}</p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <i class="pi pi-list text-2xl text-gray-600"></i>
          </div>
        </div>
      </div>

      <!-- Total Changes -->
      <div class="rounded-xl border border-sky-200 bg-sky-50 p-6 transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-sky-700">Cambios Detectados</p>
            <p class="mt-2 text-3xl font-bold text-sky-900">{{ totalChanges() }}</p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
            <i class="pi pi-sync text-2xl text-sky-600"></i>
          </div>
        </div>
      </div>

      <!-- Improved -->
      <div class="rounded-xl border border-green-200 bg-green-50 p-6 transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-700">Mejorados</p>
            <p class="mt-2 text-3xl font-bold text-green-900">{{ totalImproved() }}</p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <i class="pi pi-arrow-up text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      <!-- Degraded -->
      <div class="rounded-xl border border-red-200 bg-red-50 p-6 transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-700">Deteriorados</p>
            <p class="mt-2 text-3xl font-bold text-red-900">{{ totalDegraded() }}</p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <i class="pi pi-arrow-down text-2xl text-red-600"></i>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DetailsStatsCardsComponent {
  readonly totalItems = input.required<number>();
  readonly totalChanges = input.required<number>();
  readonly totalImproved = input.required<number>();
  readonly totalDegraded = input.required<number>();
}

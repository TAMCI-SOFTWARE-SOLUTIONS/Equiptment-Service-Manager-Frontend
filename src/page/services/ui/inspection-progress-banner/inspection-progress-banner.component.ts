import {Component, input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inspection-progress-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Desktop: Banner normal -->
    <div class="hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:block">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100">
            <i class="pi pi-check-square text-2xl text-sky-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Progreso de Inspección
            </h3>
            <p class="text-sm text-gray-600">
              {{ completed() }} de {{ total() }} items completados
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-3xl font-bold text-sky-600">{{ percentage() }}%</p>
            <p class="text-xs text-gray-500">Completado</p>
          </div>
          <div class="h-16 w-16">
            <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                class="stroke-current text-gray-200"
                stroke-width="3">
              </circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                class="stroke-current text-sky-500"
                stroke-width="3"
                stroke-dasharray="100"
                [attr.stroke-dashoffset]="100 - percentage()"
                stroke-linecap="round">
              </circle>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: Compacto -->
    <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 lg:hidden">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
          <i class="pi pi-check-square text-lg text-sky-600"></i>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">
            {{ completed() }}/{{ total() }}
          </p>
          <p class="text-xs text-gray-600">{{ percentage() }}%</p>
        </div>
      </div>
      <div class="h-10 w-10">
        <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            class="stroke-current text-gray-200"
            stroke-width="4">
          </circle>
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            class="stroke-current text-sky-500"
            stroke-width="4"
            stroke-dasharray="100"
            [attr.stroke-dashoffset]="100 - percentage()"
            stroke-linecap="round">
          </circle>
        </svg>
      </div>
    </div>
  `
})
export class InspectionProgressBannerComponent {
  readonly completed = input.required<number>();
  readonly total = input.required<number>();
  readonly percentage = input.required<number>();
}

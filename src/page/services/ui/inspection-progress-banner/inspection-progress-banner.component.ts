import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inspection-progress-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <!-- Left: Progress Info -->
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <i class="pi pi-chart-line text-xl text-blue-600"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-blue-900">
                Progreso de Inspección
              </h3>
              <p class="text-sm text-blue-700">
                {{ completed }} de {{ total }} items completados
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Percentage Circle -->
        <div class="flex shrink-0 items-center gap-4">
          <div class="relative flex h-20 w-20 items-center justify-center">
            <!-- Background Circle -->
            <svg class="absolute h-20 w-20 -rotate-90 transform">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                stroke-width="6"
                fill="none"
                class="text-blue-200"
              />
              <!-- Progress Circle -->
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                stroke-width="6"
                fill="none"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="strokeDashoffset"
                class="text-blue-600 transition-all duration-500"
                stroke-linecap="round"
              />
            </svg>
            <!-- Percentage Text -->
            <div class="relative text-center">
              <div class="text-2xl font-bold text-blue-900">
                {{ percentage }}%
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Progress Bar -->
      <div class="mt-4 h-3 overflow-hidden rounded-full bg-blue-200">
        <div
          [class]="getProgressBarColor()"
          [style.width.%]="percentage"
          class="h-full transition-all duration-500 ease-out">
        </div>
      </div>
    </div>
  `
})
export class InspectionProgressBannerComponent {
  @Input() completed: number = 0;
  @Input() total: number = 0;
  @Input() percentage: number = 0;

  readonly circumference = 2 * Math.PI * 34; // 34 es el radio

  get strokeDashoffset(): number {
    return this.circumference - (this.percentage / 100) * this.circumference;
  }

  getProgressBarColor(): string {
    if (this.percentage === 0) return 'bg-gray-300';
    if (this.percentage < 30) return 'bg-gradient-to-r from-rose-400 to-rose-500';
    if (this.percentage < 70) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    if (this.percentage < 100) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    return 'bg-gradient-to-r from-green-400 to-green-500';
  }
}

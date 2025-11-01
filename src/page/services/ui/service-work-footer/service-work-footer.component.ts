import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-service-work-footer',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <footer class="w-full relative bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-lg">
      <div class="px-4 py-3 lg:px-8">

        <div class="flex items-center justify-between gap-3">

          <!-- Back Button -->
          <button
            type="button"
            (click)="onPrevious.emit()"
            [disabled]="!canGoPrevious || isLoading"
            pRipple
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 lg:px-6">
            <i class="pi pi-arrow-left text-sm"></i>
            <span class="hidden sm:inline">Atrás</span>
          </button>

          <!-- Progress indicator (middle, desktop only) -->
          @if (showProgress) {
            <div class="hidden items-center gap-2 text-sm text-gray-600 md:flex">
              <span class="font-medium">Paso {{ currentStep }} de 4</span>
              <span class="text-gray-400">•</span>
              <span>{{ stepLabel }}</span>
            </div>
          }

          <!-- Next/Start/Complete Button -->
          @if (isLastStep) {
            <!-- Complete Button (Step 4) -->
            <button
              type="button"
              (click)="onComplete.emit()"
              [disabled]="!canComplete || isLoading"
              pRipple
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none lg:px-8">
              @if (isLoading) {
                <i class="pi pi-spin pi-spinner text-sm"></i>
                <span>Completando...</span>
              } @else {
                <i class="pi pi-check-circle text-sm"></i>
                <span class="hidden sm:inline">Completar Servicio</span>
                <span class="sm:hidden">Completar</span>
              }
            </button>
          } @else if (showStartButton) {
            <!-- Start Button (cuando status = CREATED) -->
            <button
              type="button"
              (click)="onNext.emit()"
              [disabled]="isLoading"
              pRipple
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50 lg:px-8">
              @if (isLoading) {
                <i class="pi pi-spin pi-spinner text-sm"></i>
                <span>Iniciando...</span>
              } @else {
                <i class="pi pi-play text-sm"></i>
                <span>{{ nextButtonLabel }}</span>
              }
            </button>
          } @else {
            <!-- Next Button (navegación normal) -->
            <button
              type="button"
              (click)="onNext.emit()"
              [disabled]="!canGoNext || isLoading"
              pRipple
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none lg:px-6">
              <span>{{ nextButtonLabel }}</span>
              <i class="pi pi-arrow-right text-sm"></i>
            </button>
          }

        </div>

      </div>
    </footer>
  `
})
export class ServiceWorkFooterComponent {
  @Input() currentStep: number = 1;
  @Input() stepLabel: string = '';
  @Input() isLastStep: boolean = false;
  @Input() canGoPrevious: boolean = true;
  @Input() canGoNext: boolean = true;
  @Input() canComplete: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() showProgress: boolean = true;
  @Input() nextButtonLabel: string = 'Siguiente';
  @Input() showStartButton: boolean = false; // 🆕 Indica si mostrar botón "Comenzar"

  @Output() onPrevious = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();
  @Output() onComplete = new EventEmitter<void>();
}

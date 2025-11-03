import { Component, Input, Output, EventEmitter, input } from '@angular/core';
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

          <button
            type="button"
            (click)="onPrevious.emit()"
            [disabled]="!canGoPrevious || isLoading"
            pRipple
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 lg:px-6">
            <i class="pi pi-arrow-left text-sm"></i>
            <span class="hidden sm:inline">Atrás</span>
          </button>

          @if (showProgress && !shouldShowSaveButton()) {
            <div class="hidden items-center gap-2 text-sm text-gray-600 md:flex">
              <span class="font-medium">Paso {{ currentStep }} de 4</span>
              <span class="text-gray-400">•</span>
              <span>{{ stepLabel }}</span>
            </div>
          }

          @if (shouldShowSaveButton()) {
            <div class="hidden items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 md:flex">
              <i class="pi pi-exclamation-triangle text-sm"></i>
              <span>{{ unsavedCount() }} cambio(s) sin guardar</span>
            </div>
          }

          @if (shouldShowSaveButton()) {
            <button
              type="button"
              (click)="onSave.emit()"
              [disabled]="isLoading"
              pRipple
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 lg:px-6">
              @if (isLoading) {
                <i class="pi pi-spin pi-spinner text-sm"></i>
                <span class="hidden sm:inline">Guardando...</span>
                <span class="sm:hidden">...</span>
              } @else {
                <i class="pi pi-save text-sm"></i>
                <span class="hidden sm:inline">Guardar Cambios</span>
                <span class="sm:hidden">Guardar</span>
              }
            </button>
          } @else if (isLastStep) {
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
  @Input() showStartButton: boolean = false;

  readonly hasUnsavedChanges = input<boolean>(false);
  readonly unsavedCount = input<number>(0);

  @Output() onPrevious = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();
  @Output() onComplete = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  shouldShowSaveButton(): boolean {
    return this.currentStep === 2 && this.hasUnsavedChanges();
  }
}

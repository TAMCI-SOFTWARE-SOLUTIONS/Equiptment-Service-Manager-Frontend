import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { ServiceStatusEnum } from '../../../../entities/equipment-service';

@Component({
  selector: 'app-service-work-header',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <header class="shrink-0 border-b border-gray-200 bg-white px-4 py-6 lg:px-8">
      <div class="mx-auto max-w-7xl">

        <!-- Title & Close Button -->
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0 flex-1">
            <!-- Main Title: [Tipo de Servicio] | [Tag del Equipo] -->
            <h1 class="truncate text-xl font-bold text-gray-900 lg:text-2xl">
              {{ title }}
            </h1>
            <!-- Subtitle: Paso X de 4: Nombre del paso -->
            <p class="mt-1 text-sm text-gray-600">
              Paso {{ currentStep }} de 4: {{ stepLabel }}
            </p>
          </div>

          <!-- Right Actions: Save + Close -->
          <div class="flex shrink-0 items-center gap-2">

            <!-- Save Button (con efecto de fade) -->
            <button
              pRipple
              type="button"
              (click)="onSave.emit()"
              [disabled]="!hasUnsavedChanges || isSaving"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 lg:px-4"
              [class.opacity-0]="!hasUnsavedChanges"
              [class.pointer-events-none]="!hasUnsavedChanges"
              [class.opacity-100]="hasUnsavedChanges"
              [class.bg-blue-500]="hasUnsavedChanges && !isSaving"
              [class.text-white]="hasUnsavedChanges && !isSaving"
              [class.hover:bg-blue-600]="hasUnsavedChanges && !isSaving"
              [class.bg-blue-400]="hasUnsavedChanges && isSaving"
              [class.cursor-not-allowed]="isSaving">
              @if (isSaving) {
                <i class="pi pi-spin pi-spinner text-sm"></i>
                <span class="hidden sm:inline">Guardando...</span>
              } @else {
                <i class="pi pi-save text-sm"></i>
                <span class="hidden sm:inline">Guardar</span>
              }
            </button>

            <!-- Close Button -->
            <button
              pRipple
              type="button"
              (click)="onClose.emit()"
              [disabled]="isLoading"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50">
              <i class="pi pi-times text-base"></i>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500 ease-out"
            [style.width.%]="progress">
          </div>
        </div>

        <!-- Stepper (Desktop: Labels completos) -->
        <div class="mt-6 hidden items-center justify-center gap-4 lg:flex">
          @for (step of steps; track step.number; let isLast = $last) {
            <div class="flex items-center">

              <!-- Step Button -->
              <button
                type="button"
                (click)="onStepClick.emit(step.number)"
                [disabled]="!canNavigateToStep(step.number)"
                class="group flex items-center gap-3 transition-all disabled:cursor-not-allowed disabled:opacity-50">

                <!-- Circle -->
                <div
                  class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all"
                  [class.bg-sky-500]="currentStep === step.number && isServiceInProgress"
                  [class.text-white]="currentStep === step.number && isServiceInProgress"
                  [class.shadow-lg]="currentStep === step.number && isServiceInProgress"
                  [class.bg-sky-100]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                  [class.text-sky-600]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                  [class.bg-gray-100]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)"
                  [class.text-gray-400]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)"
                  [class.group-hover:bg-gray-200]="canNavigateToStep(step.number) && currentStep !== step.number">

                  @if (step.number < currentStep && isServiceInProgress) {
                    <i class="pi pi-check text-lg font-bold"></i>
                  } @else {
                    <i class="text-lg pi" [ngClass]="step.icon"></i>
                  }
                </div>

                <!-- Label (Desktop) -->
                <div class="hidden text-left xl:block">
                  <p
                    class="text-xs font-medium uppercase tracking-wider"
                    [class.text-sky-600]="currentStep === step.number && isServiceInProgress"
                    [class.text-gray-900]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                    [class.text-gray-500]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)">
                    Paso {{ step.number }}
                  </p>
                  <p
                    class="text-sm font-semibold"
                    [class.text-sky-900]="currentStep === step.number && isServiceInProgress"
                    [class.text-gray-900]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                    [class.text-gray-600]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)">
                    {{ step.labelLong }}
                  </p>
                </div>

              </button>

              <!-- Connector Line -->
              @if (!isLast) {
                <div
                  class="mx-4 h-0.5 w-16 transition-colors xl:w-24"
                  [class.bg-sky-500]="step.number < currentStep && isServiceInProgress"
                  [class.bg-gray-200]="!isServiceInProgress || step.number >= currentStep">
                </div>
              }

            </div>
          }
        </div>

        <!-- Stepper (Tablet: Labels cortos con hover) -->
        <div class="mt-6 hidden items-center justify-center gap-4 md:flex lg:hidden">
          @for (step of steps; track step.number; let isLast = $last) {
            <div class="flex items-center">

              <!-- Step Button with Tooltip -->
              <div class="group relative">
                <button
                  type="button"
                  (click)="onStepClick.emit(step.number)"
                  [disabled]="!canNavigateToStep(step.number)"
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  [class.bg-sky-500]="currentStep === step.number && isServiceInProgress"
                  [class.text-white]="currentStep === step.number && isServiceInProgress"
                  [class.shadow-lg]="currentStep === step.number && isServiceInProgress"
                  [class.bg-sky-100]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                  [class.text-sky-600]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
                  [class.bg-gray-100]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)"
                  [class.text-gray-400]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)"
                  [class.group-hover:bg-gray-200]="canNavigateToStep(step.number) && currentStep !== step.number">

                  @if (step.number < currentStep && isServiceInProgress) {
                    <i class="pi pi-check text-lg font-bold"></i>
                  } @else {
                    <i class="text-lg pi" [ngClass]="step.icon"></i>
                  }
                </button>

                <!-- Tooltip on Hover (solo si está habilitado) -->
                @if (canNavigateToStep(step.number)) {
                  <div class="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {{ step.labelShort }}
                    <div class="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                  </div>
                }
              </div>

              <!-- Connector -->
              @if (!isLast) {
                <div
                  class="mx-3 h-0.5 w-12 transition-colors"
                  [class.bg-sky-500]="step.number < currentStep && isServiceInProgress"
                  [class.bg-gray-200]="!isServiceInProgress || step.number >= currentStep">
                </div>
              }

            </div>
          }
        </div>

        <!-- Stepper Pills (Mobile: Solo números) -->
        <div class="mt-4 flex items-center justify-center gap-2 md:hidden">
          @for (step of steps; track step.number) {
            <button
              type="button"
              (click)="onStepClick.emit(step.number)"
              [disabled]="!canNavigateToStep(step.number)"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
              [class.bg-sky-500]="currentStep === step.number && isServiceInProgress"
              [class.text-white]="currentStep === step.number && isServiceInProgress"
              [class.shadow-lg]="currentStep === step.number && isServiceInProgress"
              [class.bg-sky-100]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
              [class.text-sky-600]="currentStep !== step.number && step.number < currentStep && isServiceInProgress"
              [class.bg-gray-100]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)"
              [class.text-gray-400]="!isServiceInProgress || (currentStep !== step.number && step.number > currentStep)">

              @if (step.number < currentStep && isServiceInProgress) {
                <i class="pi pi-check text-sm font-bold"></i>
              } @else {
                <span class="text-sm font-semibold">{{ step.number }}</span>
              }
            </button>
          }
        </div>

      </div>
    </header>
  `,
  styles: [`
    /* Smooth transitions */
    button {
      transition: all 0.3s ease;
    }
  `]
})
export class ServiceWorkHeaderComponent {
  @Input() title: string = ''; // "[Tipo de Servicio] | [Tag del Equipo]"
  @Input() currentStep: number = 1;
  @Input() stepLabel: string = ''; // "Información"
  @Input() progress: number = 0; // 0-100
  @Input() hasUnsavedChanges: boolean = false;
  @Input() isSaving: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() serviceStatus: ServiceStatusEnum = ServiceStatusEnum.CREATED; // 🆕

  @Output() onClose = new EventEmitter<void>();
  @Output() onStepClick = new EventEmitter<number>();
  @Output() onSave = new EventEmitter<void>();

  // Expose enum
  readonly ServiceStatusEnum = ServiceStatusEnum;

  // Steps configuration
  steps = [
    {
      number: 1,
      icon: 'pi-info-circle',
      labelShort: 'Información',
      labelLong: 'Información'
    },
    {
      number: 2,
      icon: 'pi-list-check',
      labelShort: 'Inspección',
      labelLong: 'Inspección'
    },
    {
      number: 3,
      icon: 'pi-images',
      labelShort: 'Evidencias',
      labelLong: 'Evidencias'
    },
    {
      number: 4,
      icon: 'pi-check-circle',
      labelShort: 'Completar',
      labelLong: 'Completar'
    }
  ];

  /**
   * Determinar si el servicio está en progreso
   */
  get isServiceInProgress(): boolean {
    return this.serviceStatus === ServiceStatusEnum.IN_PROGRESS;
  }

  /**
   * Determinar si se puede navegar a un step
   * Solo se puede si el servicio está IN_PROGRESS
   * O si es el step 1 (siempre accesible)
   */
  canNavigateToStep(stepNumber: number): boolean {
    // Step 1 siempre es accesible
    if (stepNumber === 1) return true;

    // Los demás steps solo si está IN_PROGRESS
    return this.isServiceInProgress;
  }
}

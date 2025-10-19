import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SelectContextStep} from '../../../../shared/model/select-context.store';

interface StepInfo {
  step: SelectContextStep;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Desktop Stepper (Sidebar) -->
    <div class="hidden lg:block">
      <div class="sticky top-6 space-y-2">
        @for (stepInfo of steps; track stepInfo.step) {
          <button
            type="button"
            [disabled]="!isStepAccessible(stepInfo.step)"
            class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
            [class.bg-sky-50]="isStepActive(stepInfo.step)"
            [class.border-2]="isStepActive(stepInfo.step)"
            [class.border-sky-500]="isStepActive(stepInfo.step)"
            [class.hover:bg-gray-50]="!isStepActive(stepInfo.step) && isStepAccessible(stepInfo.step)">

            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
                 [class.bg-sky-500]="isStepActive(stepInfo.step)"
                 [class.text-white]="isStepActive(stepInfo.step)"
                 [class.bg-sky-100]="!isStepActive(stepInfo.step) && isStepCompleted(stepInfo.step)"
                 [class.text-sky-600]="!isStepActive(stepInfo.step) && isStepCompleted(stepInfo.step)"
                 [class.bg-gray-100]="!isStepActive(stepInfo.step) && !isStepCompleted(stepInfo.step)"
                 [class.text-gray-400]="!isStepActive(stepInfo.step) && !isStepCompleted(stepInfo.step)">
              @if (isStepCompleted(stepInfo.step) && !isStepActive(stepInfo.step)) {
                <i class="pi pi-check text-base font-bold"></i>
              } @else {
                <i class="text-base pi" [ngClass]="stepInfo.icon"></i>
              }
            </div>

            <div class="flex-1">
              <p class="text-sm font-semibold"
                 [class.text-sky-900]="isStepActive(stepInfo.step)"
                 [class.text-gray-900]="!isStepActive(stepInfo.step) && isStepCompleted(stepInfo.step)"
                 [class.text-gray-600]="!isStepActive(stepInfo.step) && !isStepCompleted(stepInfo.step)">
                {{ stepInfo.label }}
              </p>
              @if (isStepActive(stepInfo.step)) {
                <p class="mt-0.5 text-xs text-sky-600">
                  En progreso
                </p>
              } @else if (isStepCompleted(stepInfo.step)) {
                <p class="mt-0.5 text-xs text-gray-500">
                  Completado
                </p>
              }
            </div>

            @if (isStepActive(stepInfo.step)) {
              <i class="pi pi-chevron-right text-sky-600"></i>
            }
          </button>
        }
      </div>
    </div>

    <!-- Mobile Stepper (Pills) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
      @for (stepInfo of steps; track stepInfo.step) {
        <button
          type="button"
          [disabled]="!isStepAccessible(stepInfo.step)"
          class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          [class.bg-sky-500]="isStepActive(stepInfo.step)"
          [class.text-white]="isStepActive(stepInfo.step)"
          [class.shadow-lg]="isStepActive(stepInfo.step)"
          [class.bg-sky-100]="!isStepActive(stepInfo.step) && isStepCompleted(stepInfo.step)"
          [class.text-sky-700]="!isStepActive(stepInfo.step) && isStepCompleted(stepInfo.step)"
          [class.bg-gray-100]="!isStepActive(stepInfo.step) && !isStepCompleted(stepInfo.step)"
          [class.text-gray-600]="!isStepActive(stepInfo.step) && !isStepCompleted(stepInfo.step)">
          @if (isStepCompleted(stepInfo.step) && !isStepActive(stepInfo.step)) {
            <i class="pi pi-check text-xs font-bold"></i>
          } @else {
            <i class="text-xs pi" [ngClass]="stepInfo.icon"></i>
          }
          <span>{{ stepInfo.label }}</span>
        </button>
      }
    </div>
  `
})
export class StepIndicatorComponent {
  currentStep = input.required<SelectContextStep>();
  selectedClient = input<any>(null);

  steps: StepInfo[] = [
    { step: SelectContextStep.SELECT_CLIENT, label: 'Cliente', icon: 'pi-building' },
    { step: SelectContextStep.SELECT_PROJECT, label: 'Proyecto', icon: 'pi-folder' }
  ];

  isStepActive(step: SelectContextStep): boolean {
    return this.currentStep() === step;
  }

  isStepCompleted(step: SelectContextStep): boolean {
    return this.currentStep() > step;
  }

  isStepAccessible(step: SelectContextStep): boolean {
    // Solo puede ir al step 2 si ya seleccionó cliente
    if (step === SelectContextStep.SELECT_PROJECT) {
      return this.selectedClient() !== null;
    }
    return true;
  }
}

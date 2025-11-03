import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {ItemInspectionWithDetails} from '../../model/interfaces/item-inspection-with-details.interface';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {ServiceTypeEnum} from '../../../../shared/model';
import {
  CONDITION_LABELS,
  CRITICALITY_LABELS,
  isItemCompleted,
  requiresCriticality,
  shouldClearCriticality
} from '../../utils/service-work-validation.helpers';
import {MessageService} from 'primeng/api';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-inspection-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    InputText
  ],
  template: `
    <div
      class="group rounded-xl border-2 bg-white p-5 transition-all hover:shadow-md"
      [class.border-green-200]="isCompleted"
      [class.bg-green-50]="isCompleted"
      [class.ring-2]="isCompleted"
      [class.ring-green-500]="isCompleted"
      [class.border-gray-200]="!isCompleted">

      <!-- Header -->
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-1 items-start gap-3">

          <!-- Status Icon -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
               [class.bg-green-100]="isCompleted"
               [class.text-green-600]="isCompleted"
               [class.bg-blue-100]="item.isSaving"
               [class.text-blue-600]="item.isSaving"
               [class.bg-amber-100]="!isCompleted && !item.isSaving && item.condition"
               [class.text-amber-600]="!isCompleted && !item.isSaving && item.condition"
               [class.bg-gray-100]="!isCompleted && !item.isSaving && !item.condition"
               [class.text-gray-400]="!isCompleted && !item.isSaving && !item.condition">
            @if (item.isSaving) {
              <i class="pi pi-spin pi-spinner text-lg"></i>
            } @else if (isCompleted) {
              <i class="pi pi-check-circle text-lg"></i>
            } @else if (item.condition) {
              <i class="pi pi-clock text-lg"></i>
            } @else {
              <i class="pi pi-circle text-lg"></i>
            }
          </div>

          <!-- Item Info -->
          <div class="min-w-0 flex-1">
            <h3 class="font-mono text-base font-bold text-gray-900">
              {{ item.tag }}
            </h3>
            <p class="mt-0.5 text-sm text-gray-600">
              {{ item.descriptionName }}
            </p>
            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <i class="pi pi-tag text-[10px]"></i>
                Marca: {{ item.brandName }}
              </span>
              <span class="flex items-center gap-1">
                <i class="pi pi-box text-[10px]"></i>
                Modelo: {{ item.modelName }}
              </span>
            </div>
          </div>
        </div>

        <!-- Saving Status Badge -->
        @if (item.isSaving) {
          <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
            <i class="pi pi-spin pi-spinner text-[10px]"></i>
            Guardando...
          </span>
        } @else if (item.lastSaved) {
          <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            <i class="pi pi-check text-[10px]"></i>
            Guardado
          </span>
        }
      </div>

      <!-- Form Fields -->
      <div class="grid gap-4 md:grid-cols-12">

        <!-- Condición (4 cols) -->
        <div class="md:col-span-4">
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
            Condición <span class="text-rose-500">*</span>
          </label>
          <p-select
            [(ngModel)]="selectedCondition"
            [options]="conditionDropdownOptions"
            (onChange)="handleConditionChange($event.value)"
            [disabled]="item.isSaving"
            placeholder="Seleccionar..."
            optionLabel="label"
            optionValue="value"
            class="w-full"
            [style]="{'width': '100%'}">
          </p-select>
        </div>

        <!-- Criticidad (3 cols) - Conditional -->
        @if (shouldShowCriticality) {
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
              Criticidad <span class="text-rose-500">*</span>
            </label>
            <p-select
              [(ngModel)]="selectedCriticality"
              [options]="criticalityOptions"
              (onChange)="handleCriticalityChange($event.value)"
              [disabled]="item.isSaving"
              placeholder="Seleccionar..."
              optionLabel="label"
              optionValue="value"
              class="w-full"
              [style]="{'width': '100%'}">
            </p-select>
          </div>
        } @else {
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Criticidad
            </label>
            <div class="flex h-[42px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
              No aplica
            </div>
          </div>
        }

        <!-- Observación (5 cols o 8 cols) -->
        <div [class.md:col-span-8]="!shouldShowCriticality"
             [class.md:col-span-5]="shouldShowCriticality">
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
            Observación <span class="text-xs font-normal text-gray-500">(Opcional)</span>
          </label>
          <input
            pInputText
            type="text"
            [(ngModel)]="selectedObservation"
            (ngModelChange)="handleObservationChange($event)"
            [disabled]="item.isSaving"
            placeholder="Agregar observación..."
            class="w-full">
        </div>

      </div>

    </div>
  `,
})
export class InspectionItemFormComponent implements OnInit {
  private readonly messageService = inject(MessageService);

  @Input({ required: true }) item!: ItemInspectionWithDetails;
  @Input({ required: true }) conditionOptions: ItemConditionEnum[] = [];
  @Input() serviceType: ServiceTypeEnum | null = null;
  @Input() hasPreviousService: boolean = false;

  @Output() onConditionChange = new EventEmitter<ItemConditionEnum | null>();
  @Output() onCriticalityChange = new EventEmitter<CriticalityEnum | null>();
  @Output() onObservationChange = new EventEmitter<string | null>();

  selectedCondition: string | null = null;
  selectedCriticality: string | null = null;
  selectedObservation: string = '';

  conditionDropdownOptions: SelectOption[] = [];
  criticalityOptions: SelectOption[] = [
    { label: CRITICALITY_LABELS[CriticalityEnum.CRITICAL], value: CriticalityEnum.CRITICAL },
    { label: CRITICALITY_LABELS[CriticalityEnum.NOT_CRITICAL], value: CriticalityEnum.NOT_CRITICAL }
  ];

  readonly ServiceTypeEnum = ServiceTypeEnum;

  ngOnInit(): void {
    this.conditionDropdownOptions = this.conditionOptions.map(condition => ({
      label: CONDITION_LABELS[condition],
      value: condition
    }));

    this.selectedCondition = this.item.condition || null;
    this.selectedCriticality = this.item.criticality || null;
    this.selectedObservation = this.item.observation || '';

    console.log('📦 Item loaded:', {
      id: this.item.id,
      tag: this.item.tag,
      condition: this.item.condition,
      criticality: this.item.criticality,
      observation: this.item.observation,
      selectedCondition: this.selectedCondition,
      selectedCriticality: this.selectedCriticality
    });
  }

  get isCompleted(): boolean {
    return isItemCompleted(
      this.item.condition || null,
      this.item.criticality || null
    );
  }

  get shouldShowCriticality(): boolean {
    const condition = this.item.condition;
    return condition ? requiresCriticality(condition) : false;
  }

  handleConditionChange(value: string | null): void {
    const conditionValue = value as ItemConditionEnum | null;

    if (conditionValue && shouldClearCriticality(conditionValue)) {
      if (this.selectedCriticality) {
        console.log(`🧹 Auto-clearing criticality for condition: ${conditionValue}`);
        this.selectedCriticality = null;

        this.messageService.add({
          severity: 'info',
          summary: 'Criticidad removida',
          detail: `La condición "${CONDITION_LABELS[conditionValue]}" no requiere criticidad`,
          life: 3000
        });
      }
    }

    this.onConditionChange.emit(conditionValue);

    if (conditionValue && shouldClearCriticality(conditionValue)) {
      this.onCriticalityChange.emit(null);
    }
  }

  handleCriticalityChange(value: string | null): void {
    const criticalityValue = value as CriticalityEnum | null;

    if (this.item.condition && requiresCriticality(this.item.condition) && !criticalityValue) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Criticidad requerida',
        detail: `La condición "${CONDITION_LABELS[this.item.condition]}" requiere que selecciones una criticidad`,
        life: 4000
      });
    }

    this.onCriticalityChange.emit(criticalityValue);
  }

  handleObservationChange(value: string): void {
    this.onObservationChange.emit(value || null);
  }
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ComparisonDisplay,
  formatFieldComparison,
  getChangeTypeIcon,
  getChangeTypeLabel
} from '../../utils/comparison.helpers';
import {ItemInspectionWithComparison} from '../../model/interfaces/item-inspection-with-comparison.interface';
import {CONDITION_LABELS} from '../../utils/service-work-validation.helpers';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';

@Component({
  selector: 'app-inspection-item-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (item().hasChanges) {
      <!-- CON CAMBIOS -->
      <div class="flex items-start gap-3 rounded-lg border-2 p-4 transition-all"
           [class.border-green-200]="item().changeType === 'improved'"
           [class.bg-green-50]="item().changeType === 'improved'"
           [class.border-red-200]="item().changeType === 'degraded'"
           [class.bg-red-50]="item().changeType === 'degraded'"
           [class.border-sky-200]="item().changeType === 'neutral'"
           [class.bg-sky-50]="item().changeType === 'neutral'">

        <!-- Icon -->
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
             [class.bg-green-100]="item().changeType === 'improved'"
             [class.bg-red-100]="item().changeType === 'degraded'"
             [class.bg-sky-100]="item().changeType === 'neutral'">
          <i class="text-lg"
             [class]="'pi ' + getChangeIcon()"
             [class.text-green-600]="item().changeType === 'improved'"
             [class.text-red-600]="item().changeType === 'degraded'"
             [class.text-sky-600]="item().changeType === 'neutral'"></i>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1 space-y-3">

          <!-- Tag Comparison -->
          <div>
            <p class="text-xs font-medium text-gray-500">Tag</p>
            <div class="mt-1 flex items-center gap-2">
              @if (tagComparison().hasChange) {
                <span class="font-mono text-xs text-gray-500 line-through">{{ tagComparison().previous }}</span>
                <i class="pi pi-arrow-right text-xs" [class]="'text-' + tagComparison().colorClass + '-600'"></i>
                <span class="font-mono text-sm font-bold" [class]="'text-' + tagComparison().colorClass + '-900'">
                  {{ tagComparison().current }}
                </span>
              } @else {
                <span class="font-mono text-sm font-semibold text-gray-900">{{ item().tag }}</span>
              }
            </div>
          </div>

          <!-- Description Comparison -->
          <div>
            <p class="text-xs font-medium text-gray-500">Descripción</p>
            <div class="mt-1 flex items-center gap-2">
              @if (descriptionComparison().hasChange) {
                <span class="text-xs text-gray-500 line-through">{{ descriptionComparison().previous }}</span>
                <i class="pi pi-arrow-right text-xs" [class]="'text-' + descriptionComparison().colorClass + '-600'"></i>
                <span class="text-sm font-semibold" [class]="'text-' + descriptionComparison().colorClass + '-900'">
                  {{ descriptionComparison().current }}
                </span>
              } @else {
                <span class="text-sm text-gray-700">{{ item().descriptionName }}</span>
              }
            </div>
          </div>

          <!-- Brand Comparison (solo si cambió) -->
          @if (brandComparison().hasChange) {
            <div>
              <p class="text-xs font-medium text-gray-500">Marca</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-xs text-gray-500 line-through">{{ brandComparison().previous }}</span>
                <i class="pi pi-arrow-right text-xs" [class]="'text-' + brandComparison().colorClass + '-600'"></i>
                <span class="text-sm font-semibold" [class]="'text-' + brandComparison().colorClass + '-900'">
                  {{ brandComparison().current }}
                </span>
              </div>
            </div>
          }

          <!-- Model Comparison (solo si cambió) -->
          @if (modelComparison().hasChange) {
            <div>
              <p class="text-xs font-medium text-gray-500">Modelo</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-xs text-gray-500 line-through">{{ modelComparison().previous }}</span>
                <i class="pi pi-arrow-right text-xs" [class]="'text-' + modelComparison().colorClass + '-600'"></i>
                <span class="text-sm font-semibold" [class]="'text-' + modelComparison().colorClass + '-900'">
                  {{ modelComparison().current }}
                </span>
              </div>
            </div>
          }

          <!-- Condition Comparison -->
          <div>
            <p class="text-xs font-medium text-gray-500">Condición</p>
            <div class="mt-1 flex items-center gap-2">
              @if (conditionComparison().hasChange) {
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 line-through">
                  {{ getConditionLabel(conditionComparison().previous) }}
                </span>
                <i class="pi pi-arrow-right text-xs" [class]="'text-' + conditionComparison().colorClass + '-600'"></i>
                <span class="rounded-full px-2 py-1 text-xs font-semibold"
                      [class]="'bg-' + conditionComparison().colorClass + '-100 text-' + conditionComparison().colorClass + '-700'">
                  {{ getConditionLabel(conditionComparison().current) }}
                </span>
              } @else {
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  {{ getConditionLabel(item().condition!) }}
                </span>
              }
            </div>
          </div>

          <!-- Criticality Comparison (solo si aplica) -->
          @if (item().criticality || item().previousCriticality) {
            <div>
              <p class="text-xs font-medium text-gray-500">Criticidad</p>
              <div class="mt-1 flex items-center gap-2">
                @if (criticalityComparison().hasChange) {
                  <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 line-through">
                    {{ criticalityComparison().previous }}
                  </span>
                  <i class="pi pi-arrow-right text-xs" [class]="'text-' + criticalityComparison().colorClass + '-600'"></i>
                  <span class="rounded-full px-2 py-1 text-xs font-semibold"
                        [class]="'bg-' + criticalityComparison().colorClass + '-100 text-' + criticalityComparison().colorClass + '-700'">
                    {{ criticalityComparison().current }}
                  </span>
                } @else if (item().criticality) {
                  <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {{ item().criticality }}
                  </span>
                }
              </div>
            </div>
          }

          <!-- Observation (if exists) -->
          @if (item().observation) {
            <div>
              <p class="text-xs font-medium text-gray-500">Observación</p>
              <p class="mt-1 text-sm text-gray-700">{{ item().observation }}</p>
            </div>
          }

        </div>

        <!-- Change Badge -->
        <span class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1"
          [class.bg-green-100]="item().changeType === 'improved'"
          [class.text-green-700]="item().changeType === 'improved'"
          [class.bg-red-100]="item().changeType === 'degraded'"
          [class.text-red-700]="item().changeType === 'degraded'"
          [class.bg-sky-100]="item().changeType === 'neutral'"
          [class.text-sky-700]="item().changeType === 'neutral'">
          <i class="mr-1" [class]="'pi ' + getChangeBadgeIcon()"></i>
          {{ getChangeLabel() }}
        </span>

      </div>
    } @else {
      <!-- SIN CAMBIOS -->
      <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:bg-gray-50">

        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <i class="pi pi-circle text-gray-400"></i>
        </div>

        <div class="min-w-0 flex-1">
          <p class="font-mono text-sm font-semibold text-gray-900">{{ item().tag }}</p>
          <p class="mt-0.5 text-xs text-gray-600">{{ item().descriptionName }}</p>
          <p class="mt-0.5 text-xs text-gray-500">{{ item().brandName }} • {{ item().modelName }}</p>
        </div>

        <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {{ getConditionLabel(item().condition!) }}
        </span>

      </div>
    }
  `
})
export class InspectionItemComparisonComponent {
  readonly item = input.required<ItemInspectionWithComparison>();

  tagComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousTag,
      this.item().tag,
      'text'
    );
  }

  brandComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousBrandName || null,
      this.item().brandName,
      'text'
    );
  }

  modelComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousModelName || null,
      this.item().modelName,
      'text'
    );
  }

  descriptionComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousDescriptionName || null,
      this.item().descriptionName,
      'text'
    );
  }

  conditionComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousCondition,
      this.item().condition!,
      'condition'
    );
  }

  criticalityComparison(): ComparisonDisplay {
    return formatFieldComparison(
      this.item().previousCriticality,
      this.item().criticality || '',
      'criticality'
    );
  }

  // ✅ FIX: Agregar type casting
  getConditionLabel(condition: string): string {
    return CONDITION_LABELS[condition as ItemConditionEnum] || condition;
  }

  getChangeIcon(): string {
    const type = this.item().changeType;
    if (type === 'improved') return 'pi-arrow-up';
    if (type === 'degraded') return 'pi-arrow-down';
    return 'pi-arrow-right';
  }

  getChangeBadgeIcon(): string {
    return getChangeTypeIcon(this.item().changeType);
  }

  getChangeLabel(): string {
    return getChangeTypeLabel(this.item().changeType);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';
import { TabConfig, TabProgress } from '../../model/interfaces/tab-config.interface';

@Component({
  selector: 'app-inspection-tabs',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">

      <!-- Tabs Header (Desktop) -->
      <div class="hidden border-b border-gray-200 lg:block">
        <div class="flex overflow-x-auto">
          @for (tab of tabConfigs; track tab.type) {
            <button
              type="button"
              (click)="onTabChange.emit(tab.type)"
              pRipple
              class="group relative flex shrink-0 items-center gap-2.5 border-b-2 px-5 py-4 text-sm font-medium transition-all hover:bg-gray-50"
              [class.border-sky-500]="currentTab === tab.type"
              [class.text-sky-700]="currentTab === tab.type"
              [class.bg-sky-50]="currentTab === tab.type"
              [class.border-transparent]="currentTab !== tab.type"
              [class.text-gray-600]="currentTab !== tab.type">

              <!-- Icon -->
              <i [class]="'pi ' + tab.icon" class="text-base"></i>

              <!-- Label -->
              <span>{{ tab.label }}</span>

              <!-- Progress Dots -->
              @if (getTabProgress(tab.type); as progress) {
                <div class="flex items-center gap-1">
                  @for (dot of getProgressDots(progress); track $index) {
                    <div
                      class="h-1.5 w-1.5 rounded-full transition-colors"
                      [class.bg-green-500]="dot === 'completed'"
                      [class.bg-gray-300]="dot === 'pending'">
                    </div>
                  }
                </div>

                <!-- Badge -->
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold transition-colors"
                  [class.bg-green-100]="progress.completed === progress.total && progress.total > 0"
                  [class.text-green-700]="progress.completed === progress.total && progress.total > 0"
                  [class.bg-gray-100]="progress.completed !== progress.total || progress.total === 0"
                  [class.text-gray-600]="progress.completed !== progress.total || progress.total === 0">
                  {{ progress.completed }}/{{ progress.total }}
                </span>
              }

              <!-- Active Indicator (Bottom bar) -->
              @if (currentTab === tab.type) {
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"></div>
              }
            </button>
          }
        </div>
      </div>

      <!-- Tabs Dropdown (Mobile & Tablet) -->
      <div class="border-b border-gray-200 p-4 lg:hidden">
        <div class="relative">
          <select
            [value]="currentTab"
            (change)="onTabChange.emit($any($event.target).value)"
            class="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            @for (tab of tabConfigs; track tab.type) {
              <option [value]="tab.type">
                {{ tab.label }}
                @if (getTabProgress(tab.type); as progress) {
                  ({{ progress.completed }}/{{ progress.total }})
                }
              </option>
            }
          </select>
          <i class="pi pi-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <!-- Progress indicator for selected tab (mobile) -->
        @if (getTabProgress(currentTab); as progress) {
          <div class="mt-3 flex items-center justify-between text-sm">
            <span class="text-gray-600">Progreso:</span>
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                @for (dot of getProgressDots(progress); track $index) {
                  <div
                    class="h-2 w-2 rounded-full"
                    [class.bg-green-500]="dot === 'completed'"
                    [class.bg-gray-300]="dot === 'pending'">
                  </div>
                }
              </div>
              <span class="font-semibold text-gray-900">
                {{ progress.completed }}/{{ progress.total }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Content Slot -->
      <div class="p-6">
        <ng-content></ng-content>
      </div>

    </div>
  `
})
export class InspectionTabsComponent {
  @Input({ required: true }) tabConfigs: TabConfig[] = [];
  @Input({ required: true }) currentTab!: InspectableItemTypeEnum;
  @Input({ required: true }) tabProgressMap!: Map<InspectableItemTypeEnum, TabProgress>;

  @Output() onTabChange = new EventEmitter<InspectableItemTypeEnum>();

  getTabProgress(type: InspectableItemTypeEnum): TabProgress | undefined {
    return this.tabProgressMap.get(type);
  }

  /**
   * Generar array de dots para visualizar progreso
   * Máximo 5 dots
   */
  getProgressDots(progress: TabProgress): ('completed' | 'pending')[] {
    if (progress.total === 0) return [];

    const maxDots = Math.min(progress.total, 5);
    const dots: ('completed' | 'pending')[] = [];

    for (let i = 0; i < maxDots; i++) {
      dots.push(i < progress.completed ? 'completed' : 'pending');
    }

    return dots;
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evidence-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
            <i [class]="'pi ' + icon + ' text-lg text-sky-700'"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
      </div>

      <div class="p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EvidenceSectionComponent {
  @Input() title: string = '';
  @Input() icon: string = 'pi-file';
}

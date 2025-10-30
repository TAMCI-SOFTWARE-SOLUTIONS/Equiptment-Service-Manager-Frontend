import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brands-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 px-4 py-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        @for (i of [1, 2, 3]; track i) {
          <div class="mb-4 animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <!-- Group Skeleton -->
            <div class="flex items-center gap-4 p-5">
              <div class="h-10 w-10 rounded-lg bg-gray-200"></div>
              <div class="flex-1">
                <div class="mb-2 h-5 w-40 rounded bg-gray-200"></div>
                <div class="h-3 w-24 rounded bg-gray-200"></div>
              </div>
              <div class="h-4 w-4 rounded bg-gray-200"></div>
            </div>

            <!-- Type Skeletons -->
            <div class="border-t border-gray-100 bg-gray-50 p-4">
              <div class="space-y-3">
                @for (j of [1, 2]; track j) {
                  <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-gray-200"></div>
                      <div class="h-4 w-32 rounded bg-gray-200"></div>
                      <div class="ml-auto h-5 w-8 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class BrandsLoadingComponent {}

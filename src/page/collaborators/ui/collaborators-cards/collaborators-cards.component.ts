import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import {CollaboratorsStore} from '../../model/store/collaborators.store';
import {GenderEnum} from '../../../../entities/profile';

@Component({
  selector: 'app-collaborators-cards',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <div class="space-y-3">

      @for (collaborator of store.paginatedCollaborators(); track collaborator.id) {
        <article class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">

          <div class="flex items-start gap-3">

            <!-- Photo -->
            @if (collaborator.photoUrl) {
              <img
                [src]="collaborator.photoUrl"
                [alt]="collaborator.fullName"
                class="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm">
            } @else {
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-semibold text-white shadow-sm">
                {{ collaborator.initials }}
              </div>
            }

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-semibold text-gray-900">
                {{ collaborator.fullName }}
              </h3>
              <p class="mt-0.5 truncate text-xs text-gray-600">
                {{ collaborator.email }}
              </p>

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <!-- Document -->
                <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  <i class="pi pi-id-card text-[10px]"></i>
                  {{ collaborator.identityDocumentNumber }}
                </span>

                <!-- Gender -->
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      [ngClass]="{
                        'bg-blue-100 text-blue-700': collaborator.gender === GenderEnum.MALE,
                        'bg-pink-100 text-pink-700': collaborator.gender === GenderEnum.FEMALE
                      }">
                  <i class="pi text-[10px]"
                     [ngClass]="{
                        'pi-mars': collaborator.gender === GenderEnum.MALE,
                        'pi-venus': collaborator.gender === GenderEnum.FEMALE
                     }"></i>
                  {{ store.getGenderLabel(collaborator.gender) }}
                </span>
              </div>
            </div>

            <!-- Action -->
            <button
              pRipple
              type="button"
              (click)="viewCollaborator.emit(collaborator.id)"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white transition-all hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
              <i class="pi pi-chevron-right text-xs"></i>
            </button>

          </div>

        </article>
      } @empty {
        <div class="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center">
          <i class="pi pi-users mb-3 text-4xl text-gray-300"></i>
          <p class="text-sm font-medium text-gray-900">
            No se encontraron colaboradores
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      }

      <!-- Pagination (Mobile) -->
      @if (store.totalPages() > 1) {
        <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">

          <button
            pRipple
            type="button"
            (click)="store.previousPage()"
            [disabled]="store.currentPage() === 1"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
            <i class="pi pi-chevron-left text-xs"></i>
          </button>

          <span class="text-xs font-medium text-gray-600">
            {{ store.currentPage() }} / {{ store.totalPages() }}
          </span>

          <button
            pRipple
            type="button"
            (click)="store.nextPage()"
            [disabled]="store.currentPage() === store.totalPages()"
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
            <i class="pi pi-chevron-right text-xs"></i>
          </button>

        </div>
      }

    </div>
  `
})
export class CollaboratorsCardsComponent {
  readonly store = inject(CollaboratorsStore);

  // Events
  readonly viewCollaborator = output<string>();
  protected readonly GenderEnum = GenderEnum;
}

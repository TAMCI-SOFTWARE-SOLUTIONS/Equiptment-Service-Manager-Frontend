import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProfileStore} from '../../model/store/profile.store';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Photo & Name Section -->
      <div class="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">

        <!-- Avatar / Photo -->
        <div class="mb-4 sm:mb-0 sm:mr-6">
          @if (store.photoUrl()) {
            <img
              [src]="store.photoUrl()!"
              [alt]="store.fullName()"
              class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg">
          } @else {
            <div class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-400 to-cyan-500 text-4xl font-bold text-white shadow-lg">
              {{ store.initials() }}
            </div>
          }
        </div>

        <!-- Name & Email -->
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ store.fullName() }}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            {{ store.profile()?.email }}
          </p>

          <!-- Quick Stats (Optional) -->
          <div class="mt-4 flex flex-wrap gap-3">
            <div class="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm">
              <i class="pi pi-user text-sky-600"></i>
              <span class="text-sky-700">{{ store.genderLabel() }}</span>
            </div>
            <div class="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm">
              <i class="pi pi-id-card text-sky-600"></i>
              <span class="text-sky-700">{{ store.documentTypeLabel() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Cards -->
      <div class="grid gap-6 lg:grid-cols-2">

        <!-- Card: Personal Information -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                <i class="pi pi-user text-lg text-sky-600"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                Información Personal
              </h3>
            </div>
          </div>

          <div class="p-6">
            <dl class="space-y-4">
              <!-- Nombres -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombres
                </dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ store.profile()?.names }}
                </dd>
              </div>

              <!-- Primer Apellido -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Primer Apellido
                </dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ store.profile()?.firstSurname }}
                </dd>
              </div>

              <!-- Segundo Apellido -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Segundo Apellido
                </dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ store.profile()?.secondSurname }}
                </dd>
              </div>

              <!-- Género -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Género
                </dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ store.genderLabel() }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Card: Document Information -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                <i class="pi pi-id-card text-lg text-sky-600"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                Documento de Identidad
              </h3>
            </div>
          </div>

          <div class="p-6">
            <dl class="space-y-4">
              <!-- Tipo de Documento -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo de Documento
                </dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">
                  {{ store.documentTypeLabel() }}
                </dd>
              </div>

              <!-- Número de Documento -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Número de Documento
                </dt>
                <dd class="mt-1 text-base font-semibold text-gray-900">
                  {{ store.profile()?.identityDocumentNumber }}
                </dd>
              </div>

              <!-- Email -->
              <div>
                <dt class="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Correo Electrónico
                </dt>
                <dd class="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <i class="pi pi-envelope text-gray-400"></i>
                  {{ store.profile()?.email }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

      </div>

      <!-- Info Note -->
      <div class="rounded-lg border border-sky-200 bg-sky-50 p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle mt-0.5 text-sky-600"></i>
          <div class="flex-1">
            <p class="text-sm text-sky-900">
              Para actualizar tu información personal, haz clic en el botón <strong>"Editar Perfil"</strong> en la parte superior.
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ProfileViewComponent {
  readonly store = inject(ProfileStore);
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {ContextStore} from '../../../../shared/model/context.store';

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- Loading state -->
    @if (contextStore.isLoading()) {
      <div class="flex items-center justify-center h-screen">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-5xl text-sky-600 mb-4"></i>
          <p class="text-surface-600">Cargando contexto...</p>
        </div>
      </div>
    }

    <!-- Error state -->
    @else if (contextStore.error()) {
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i class="pi pi-exclamation-triangle text-red-600 text-4xl mb-4"></i>
        <p class="text-red-800 mb-4">{{ contextStore.error() }}</p>
        <button
          pButton
          label="Seleccionar Cliente y Proyecto"
          (click)="router.navigate(['/clients'])">
        </button>
      </div>
    }

    <!-- Normal dashboard -->
    @else if (contextStore.hasContext()) {
      <div>
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p class="text-surface-600 mb-6">
          Cliente: <strong>{{ contextStore.client()?.name }}</strong> →
          Proyecto: <strong>{{ contextStore.project()?.name }}</strong>
        </p>

        <!-- Resto del dashboard -->
      </div>
    }
  `,
  standalone: true
})
export class DashboardPage {
  readonly contextStore = inject(ContextStore);
  readonly router = inject(Router);
}

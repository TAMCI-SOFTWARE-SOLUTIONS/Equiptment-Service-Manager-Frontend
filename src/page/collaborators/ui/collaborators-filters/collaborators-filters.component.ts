import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';
import {CollaboratorsStore} from '../../model/store/collaborators.store';
import {GenderEnum} from '../../../../entities/profile';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';

@Component({
  selector: 'app-collaborators-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer, Ripple],
  template: `
    <p-drawer
      [visible]="visible()"
      [position]="'right'"
      [style]="{width: '280px'}"
      (visibleChange)="visibleChange.emit($event)"
      header="Filtros">

      <div class="space-y-4">

        <!-- Gender Filter -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Género
          </label>
          <select
            [value]="store.filterByGender() || ''"
            (change)="onGenderChange($any($event.target).value)"
            class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            <option value="">Todos</option>
            <option [value]="GenderEnum.MALE">Masculino</option>
            <option [value]="GenderEnum.FEMALE">Femenino</option>
          </select>
        </div>

        <!-- Document Type Filter -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            [value]="store.filterByDocumentType() || ''"
            (change)="onDocumentTypeChange($any($event.target).value)"
            class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            <option value="">Todos</option>
            <option [value]="IdentityDocumentTypeEnum.DNI">DNI</option>
            <option [value]="IdentityDocumentTypeEnum.FOREIGNER_ID_CARD">Carné de Extranjería</option>
            <option [value]="IdentityDocumentTypeEnum.PASSPORT">Pasaporte</option>
            <option [value]="IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT">Permiso Temporal</option>
            <option [value]="IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD">Carné de Residencia Temporal</option>
            <option [value]="IdentityDocumentTypeEnum.OTHER">Otro</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 border-t border-gray-200 pt-4">
          <button
            pRipple
            type="button"
            (click)="store.clearFilters()"
            class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Limpiar
          </button>
          <button
            pRipple
            type="button"
            (click)="visibleChange.emit(false)"
            class="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600">
            Aplicar
          </button>
        </div>

      </div>
    </p-drawer>
  `
})
export class CollaboratorsFiltersComponent {
  readonly store = inject(CollaboratorsStore);

  // Input/Output for drawer visibility
  visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();

  // Expose enums
  readonly GenderEnum = GenderEnum;
  readonly IdentityDocumentTypeEnum = IdentityDocumentTypeEnum;

  onGenderChange(value: string): void {
    this.store.setGenderFilter(value ? value as GenderEnum : null);
  }

  onDocumentTypeChange(value: string): void {
    this.store.setDocumentTypeFilter(value ? value as IdentityDocumentTypeEnum : null);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentEntity } from '../../../../entities/equipment/model/equipment.entity';
import { getEquipmentStatusLabel, getEquipmentStatusColor } from '../../../../entities/equipment/model/equipment-status.enum';
import { Ripple } from 'primeng/ripple';
import {getEquipmentTypeEmoji, getEquipmentTypeLabel} from '../../../../shared/model/enums/equipment-type.enum';

@Component({
  selector: 'app-equipment-card',
  standalone: true,
  imports: [CommonModule, Ripple],
  template: `
    <div class="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">

      <!-- Header -->
      <div class="mb-3 flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100 text-2xl">
            {{ getEquipmentTypeEmoji(equipment.type) }}
          </div>
          <div class="flex-1">
            <h3 class="text-base font-semibold text-gray-900">
              {{ equipment.tag }}
            </h3>
            <p class="text-xs text-gray-600">
              {{ getEquipmentTypeLabel(equipment.type) }}
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              [ngClass]="getEquipmentStatusColor(equipment.status).bg + ' ' + getEquipmentStatusColor(equipment.status).text + ' ' + getEquipmentStatusColor(equipment.status).border + ' border'">
          <span class="h-1.5 w-1.5 rounded-full"
                [ngClass]="getEquipmentStatusColor(equipment.status).indicator"></span>
          {{ getEquipmentStatusLabel(equipment.status) }}
        </span>
      </div>

      <!-- Info -->
      <div class="space-y-2">
        <!-- Tipo de equipo -->
        <div class="flex items-start gap-2">
          <i class="pi pi-tag mt-0.5 text-xs text-gray-400"></i>
          <div class="flex-1">
            <p class="text-xs text-gray-500">Tipo</p>
            <p class="text-sm font-medium text-gray-900">
              {{ equipment.equipmentTypeName || 'No especificado' }}
            </p>
          </div>
        </div>

        <!-- Ubicación -->
        <div class="flex items-start gap-2">
          <i class="pi pi-map-marker mt-0.5 text-xs text-gray-400"></i>
          <div class="flex-1">
            <p class="text-xs text-gray-500">Ubicación</p>
            <p class="text-sm text-gray-900">
              {{ equipment.plantName || 'N/A' }}
            </p>
            <p class="text-xs text-gray-600">
              {{ equipment.areaName || 'N/A' }}
              @if (equipment.locationName ) {
                • {{ equipment.locationName || 'N/A' }}
              }
            </p>
            @if (equipment.referenceLocation ) {
              <p class="text-xs text-gray-600">{{ equipment.referenceLocation || 'N/A' }}</p>
            }
          </div>
        </div>

        <!-- Protocolo -->
        @if (equipment.communicationProtocol) {
          <div class="flex items-start gap-2">
            <i class="pi pi-wifi mt-0.5 text-xs text-gray-400"></i>
            <div class="flex-1">
              <p class="text-xs text-gray-500">Protocolo</p>
              <p class="text-sm text-gray-900">
                {{ equipment.communicationProtocol }}
              </p>
            </div>
          </div>
        }

        <!-- Última revisión -->
        <!--TODO: Change for the service type the user choose and then only show the last service according to service type-->
        @if (equipment.lastInspectionAt) {
          <div class="flex items-start gap-2">
            <i class="pi pi-clock mt-0.5 text-xs text-gray-400"></i>
            <div class="flex-1">
              <p class="text-xs text-gray-500">Última revisión</p>
              <p class="text-sm text-gray-900">
                {{ equipment.lastInspectionAt | date:'short' }}
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        <button
          pRipple
          type="button"
          (click)="onView.emit(equipment)"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50">
          <i class="pi pi-eye text-sm"></i>
          <span>Ver</span>
        </button>

        <button
          pRipple
          type="button"
          (click)="onEdit.emit(equipment)"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600">
          <i class="pi pi-pencil text-sm"></i>
        </button>

        <button
          pRipple
          type="button"
          (click)="onDelete.emit(equipment)"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600">
          <i class="pi pi-trash text-sm"></i>
        </button>
      </div>

    </div>
  `
})
export class EquipmentCardComponent {
  @Input({ required: true }) equipment!: EquipmentEntity;

  @Output() onView = new EventEmitter<EquipmentEntity>();
  @Output() onEdit = new EventEmitter<EquipmentEntity>();
  @Output() onDelete = new EventEmitter<EquipmentEntity>();

  // Expose helpers to template
  getEquipmentTypeEmoji = getEquipmentTypeEmoji;
  getEquipmentTypeLabel = getEquipmentTypeLabel;
  getEquipmentStatusLabel = getEquipmentStatusLabel;
  getEquipmentStatusColor = getEquipmentStatusColor;
}

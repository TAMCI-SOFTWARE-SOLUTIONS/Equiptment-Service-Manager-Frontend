import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';

interface TypeOption {
  enum: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: 'sky' | 'cyan';
  category: string;
}

interface GroupedTypes {
  category: string;
  categoryIcon: string;
  types: TypeOption[];
}

type Step = 'select-type' | 'enter-name';

@Component({
  selector: 'app-select-brand-type-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, Drawer, Ripple],
  template: `
    <p-drawer
      [(visible)]="visible"
      [position]="'right'"
      [modal]="true"
      [dismissible]="true"
      (onHide)="onClose()"
      [styleClass]="'!w-full sm:!w-[400px]'"
    >
      <ng-template #header>
        <div class="flex items-center gap-3">
          <!-- Back Button (Step 2) -->
          @if (currentStep === 'enter-name') {
            <button
              type="button"
              (click)="goBackToSelectType()"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100">
              <i class="pi pi-arrow-left text-sm"></i>
            </button>
          }

          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500">
            <i [class]="'text-sm text-white ' + (currentStep === 'select-type' ? 'pi pi-plus' : 'pi pi-tag')"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ currentStep === 'select-type' ? 'Nueva Marca' : 'Crear Marca' }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ currentStep === 'select-type' ? 'Selecciona la categoría' : selectedTypeLabel }}
            </p>
          </div>
        </div>
      </ng-template>

      <!-- STEP 1: Select Type -->
      @if (currentStep === 'select-type') {
        <div class="space-y-4 py-2">
          @for (group of groupedTypes; track group.category) {
            <div>
              <!-- Category Label -->
              <div class="mb-2 flex items-center gap-2 px-1">
                <i [class]="'pi ' + group.categoryIcon + ' text-xs text-gray-400'"></i>
                <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ group.category }}
                </span>
              </div>

              <!-- Type Options -->
              <div class="space-y-2">
                @for (type of group.types; track type.enum) {
                  <button
                    type="button"
                    (click)="selectType(type)"
                    pRipple
                    class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-sky-300 hover:bg-sky-50"
                  >
                    <div
                      [class]="
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ' +
                        (type.color === 'cyan' ? 'bg-cyan-100' : 'bg-sky-100')
                      "
                    >
                      <i
                        [class]="
                          'pi ' +
                          type.icon +
                          ' text-sm ' +
                          (type.color === 'cyan' ? 'text-cyan-600' : 'text-sky-600')
                        "
                      ></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{{ type.label }}</h3>
                      <p class="text-xs text-gray-500">Agregar marca en {{ type.label }}</p>
                    </div>
                    <i class="pi pi-chevron-right text-sm text-gray-400"></i>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- STEP 2: Enter Brand Name -->
      @if (currentStep === 'enter-name') {
        <div class="py-4">
          <!-- Selected Type Badge -->
          <div class="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div
              [class]="
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' +
                (selectedTypeColor === 'cyan' ? 'bg-cyan-100' : 'bg-sky-100')
              "
            >
              <i
                [class]="
                  'pi ' +
                  selectedTypeIcon +
                  ' text-xs ' +
                  (selectedTypeColor === 'cyan' ? 'text-cyan-600' : 'text-sky-600')
                "
              ></i>
            </div>
            <div>
              <p class="text-xs text-gray-500">Categoría</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedTypeLabel }}</p>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <div>
              <label for="brand-name-input" class="mb-2 block text-sm font-medium text-gray-900">
                Nombre de la marca
              </label>
              <input
                #brandNameInput
                id="brand-name-input"
                type="text"
                [(ngModel)]="brandName"
                (keydown.enter)="onSave()"
                (keydown.escape)="onClose()"
                placeholder="Ej: Schneider Electric"
                class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                [class.border-rose-500]="brandName.trim().length > 0 && brandName.trim().length < 2"
              />

              <!-- Validations -->
              @if (brandName.trim().length > 0 && brandName.trim().length < 2) {
                <p class="mt-1.5 text-xs text-rose-500">
                  <i class="pi pi-exclamation-circle mr-1"></i>
                  El nombre debe tener al menos 2 caracteres
                </p>
              }
              @if (brandName.trim().length > 50) {
                <p class="mt-1.5 text-xs text-rose-500">
                  <i class="pi pi-exclamation-circle mr-1"></i>
                  El nombre no puede tener más de 50 caracteres
                </p>
              }
              @if (isValid) {
                <p class="mt-1.5 text-xs text-gray-500">
                  <i class="pi pi-info-circle mr-1"></i>
                  Presiona Enter para guardar o Esc para cancelar
                </p>
              }
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                type="button"
                (click)="onClose()"
                pRipple
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button
                type="button"
                (click)="onSave()"
                [disabled]="!isValid || isSaving"
                pRipple
                class="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50">
                @if (isSaving) {
                  <i class="pi pi-spin pi-spinner mr-2"></i>
                }
                {{ isSaving ? 'Guardando...' : 'Crear marca' }}
              </button>
            </div>
          </div>
        </div>
      }
    </p-drawer>
  `,
  styles: [`
  `]
})
export class SelectBrandTypeDrawerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() brandCreated = new EventEmitter<{ type: InspectableItemTypeEnum; name: string }>();

  // State
  currentStep: Step = 'select-type';
  selectedType: InspectableItemTypeEnum | null = null;
  selectedTypeLabel = '';
  selectedTypeIcon = '';
  selectedTypeColor: 'sky' | 'cyan' = 'sky';
  brandName = '';
  isSaving = false;

  // Configuración de tipos agrupados por categoría
  readonly groupedTypes: GroupedTypes[] = [
    {
      category: 'Componentes',
      categoryIcon: 'pi-microchip',
      types: [
        {
          enum: InspectableItemTypeEnum.COMMUNICATION,
          label: 'Comunicación',
          icon: 'pi-wifi',
          color: 'sky',
          category: 'COMPONENTES'
        },
        {
          enum: InspectableItemTypeEnum.STATE,
          label: 'Estado',
          icon: 'pi-circle',
          color: 'cyan',
          category: 'COMPONENTES'
        }
      ]
    },
    {
      category: 'Dispositivos',
      categoryIcon: 'pi-bolt',
      types: [
        {
          enum: InspectableItemTypeEnum.POWER_SUPPLY,
          label: 'Fuentes',
          icon: 'pi-bolt',
          color: 'sky',
          category: 'DISPOSITIVOS'
        },
        {
          enum: InspectableItemTypeEnum.POWER_120VAC,
          label: 'Alimentación 120VAC',
          icon: 'pi-lightbulb',
          color: 'cyan',
          category: 'DISPOSITIVOS'
        }
      ]
    },
    {
      category: 'Adicionales',
      categoryIcon: 'pi-ellipsis-h',
      types: [
        {
          enum: InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
          label: 'Orden y Limpieza',
          icon: 'pi-check-circle',
          color: 'sky',
          category: 'ADICIONALES'
        },
        {
          enum: InspectableItemTypeEnum.OTHERS,
          label: 'Otros',
          icon: 'pi-folder',
          color: 'cyan',
          category: 'ADICIONALES'
        }
      ]
    }
  ];

  get isValid(): boolean {
    const trimmed = this.brandName.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  }

  selectType(type: TypeOption): void {
    this.selectedType = type.enum;
    this.selectedTypeLabel = type.label;
    this.selectedTypeIcon = type.icon;
    this.selectedTypeColor = type.color;
    this.currentStep = 'enter-name';

    // Auto-focus en el input después de la transición
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('#brand-name-input');
      input?.focus();
    }, 100);
  }

  goBackToSelectType(): void {
    this.currentStep = 'select-type';
    this.brandName = '';
  }

  onSave(): void {
    if (!this.isValid || !this.selectedType || this.isSaving) return;

    this.isSaving = true;

    // Emitir evento al padre para que guarde
    this.brandCreated.emit({
      type: this.selectedType,
      name: this.brandName.trim()
    });
  }

  onClose(): void {
    // Reset state
    this.currentStep = 'select-type';
    this.selectedType = null;
    this.brandName = '';
    this.isSaving = false;

    // Close drawer
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // Llamar esto desde el padre después de que se cree exitosamente
  resetAfterSuccess(): void {
    this.isSaving = false;
    this.onClose();
  }

  // Llamar esto desde el padre si hay error
  resetAfterError(): void {
    this.isSaving = false;
  }
}

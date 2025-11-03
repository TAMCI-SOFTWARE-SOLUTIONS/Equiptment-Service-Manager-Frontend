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
  templateUrl: './select-brand-type-drawer.component.html'
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

    setTimeout(() => {
      document.querySelector<HTMLInputElement>('#brand-name-input')?.focus();
    }, 100);
  }

  goBackToSelectType(): void {
    this.currentStep = 'select-type';
    this.brandName = '';
  }

  onSave(): void {
    if (!this.isValid || !this.selectedType || this.isSaving) return;

    this.isSaving = true;

    this.brandCreated.emit({
      type: this.selectedType,
      name: this.brandName.trim()
    });
  }

  onClose(): void {
    this.currentStep = 'select-type';
    this.selectedType = null;
    this.brandName = '';
    this.isSaving = false;

    this.visible = false;
    this.visibleChange.emit(false);
  }

  resetAfterSuccess(): void {
    this.isSaving = false;
    this.onClose();
  }

  resetAfterError(): void {
    this.isSaving = false;
  }
}

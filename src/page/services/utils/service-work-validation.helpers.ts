import { InspectableItemTypeEnum } from '../../../shared/model/enums';
import { ItemConditionEnum } from '../../../shared/model/enums/item-condition.enum';
import { CriticalityEnum } from '../../../shared/model/enums/criticality.enum';

export const CONDITION_BY_TYPE: Record<InspectableItemTypeEnum, ItemConditionEnum[]> = {
  [InspectableItemTypeEnum.COMMUNICATION]: [
    ItemConditionEnum.OPERATIONAL,
    ItemConditionEnum.FAILURE
  ],
  [InspectableItemTypeEnum.STATE]: [
    ItemConditionEnum.OPERATIONAL,
    ItemConditionEnum.FAILURE
  ],
  [InspectableItemTypeEnum.POWER_120VAC]: [
    ItemConditionEnum.OPERATIONAL,
    ItemConditionEnum.FAILURE
  ],
  [InspectableItemTypeEnum.POWER_SUPPLY]: [
    ItemConditionEnum.OPERATIONAL,
    ItemConditionEnum.FAILURE
  ],
  [InspectableItemTypeEnum.OTHERS]: [
    ItemConditionEnum.MISSING,
    ItemConditionEnum.BAD_STATE
  ],
  [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: [
    ItemConditionEnum.OK,
    ItemConditionEnum.DEFICIENT
  ]
};

export const CONDITIONS_WITH_CRITICALITY: ItemConditionEnum[] = [
  ItemConditionEnum.FAILURE,
  ItemConditionEnum.BAD_STATE,
  ItemConditionEnum.DEFICIENT
];


export const VALID_CONDITIONS_FOR_RAISE: ItemConditionEnum[] = [
  ItemConditionEnum.OPERATIONAL,
  ItemConditionEnum.OK
];

export function requiresCriticality(condition: ItemConditionEnum | null | undefined): boolean {
  if (!condition) return false;
  return CONDITIONS_WITH_CRITICALITY.includes(condition);
}

export function isItemCompleted(
  condition: ItemConditionEnum | null | undefined,
  criticality: CriticalityEnum | null | undefined
): boolean {
  if (!condition) return false;

  if (requiresCriticality(condition)) {
    return criticality !== null && criticality !== undefined;
  }

  return true;
}

export function isValidForRaiseObservation(
  condition: ItemConditionEnum | null | undefined,
  criticality: CriticalityEnum | null | undefined
): boolean {
  if (!condition) return false;
  return VALID_CONDITIONS_FOR_RAISE.includes(condition) && (criticality === null || criticality === undefined);
}


export interface ValidationError {
  itemId: string;
  itemTag: string;
  field: 'condition' | 'criticality';
  message: string;
}


export function shouldClearCriticality(condition: ItemConditionEnum | null): boolean {
  if (!condition) return false;
  return !requiresCriticality(condition);
}

export function validateItem(
  itemId: string,
  itemTag: string,
  condition: ItemConditionEnum | null,
  criticality: CriticalityEnum | null
): ValidationError | null {
  if (!condition) {
    return {
      itemId,
      itemTag,
      field: 'condition',
      message: `${itemTag}: Debes seleccionar una condición`
    };
  }

  if (requiresCriticality(condition) && !criticality) {
    return {
      itemId,
      itemTag,
      field: 'criticality',
      message: `${itemTag}: La condición "${CONDITION_LABELS[condition]}" requiere criticidad`
    };
  }

  if (!requiresCriticality(condition) && criticality) {
    return {
      itemId,
      itemTag,
      field: 'criticality',
      message: `${itemTag}: La condición "${CONDITION_LABELS[condition]}" no requiere criticidad`
    };
  }

  return null;
}

export function validateItems(
  items: Array<{
    id: string;
    tag: string;
    condition: ItemConditionEnum | null;
    criticality: CriticalityEnum | null;
  }>
): ValidationError[] {
  const errors: ValidationError[] = [];

  items.forEach(item => {
    const error = validateItem(item.id, item.tag, item.condition, item.criticality);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

export const CONDITION_LABELS: Record<ItemConditionEnum, string> = {
  [ItemConditionEnum.OPERATIONAL]: 'Operativo',
  [ItemConditionEnum.FAILURE]: 'Falla',
  [ItemConditionEnum.BAD_STATE]: 'Mal Estado',
  [ItemConditionEnum.MISSING]: 'Falta',
  [ItemConditionEnum.OK]: 'OK',
  [ItemConditionEnum.DEFICIENT]: 'Deficiente'
};

export const CRITICALITY_LABELS: Record<CriticalityEnum, string> = {
  [CriticalityEnum.CRITICAL]: 'Crítico',
  [CriticalityEnum.NOT_CRITICAL]: 'No Crítico'
};

/**
 * Labels de tipos de inspectable item en español
 */
export const INSPECTABLE_TYPE_LABELS: Record<InspectableItemTypeEnum, string> = {
  [InspectableItemTypeEnum.COMMUNICATION]: 'Comunicación',
  [InspectableItemTypeEnum.STATE]: 'Estado',
  [InspectableItemTypeEnum.POWER_SUPPLY]: 'Fuentes',
  [InspectableItemTypeEnum.POWER_120VAC]: 'Alimentación 120 VAC',
  [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: 'Orden y Limpieza',
  [InspectableItemTypeEnum.OTHERS]: 'Otros'
};

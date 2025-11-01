import { InspectableItemTypeEnum } from '../../../shared/model/enums';
import {ItemConditionEnum} from '../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../shared/model/enums/criticality.enum';

/**
 * Condiciones permitidas por tipo de inspectable item
 */
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

/**
 * Condiciones que requieren mostrar criticidad
 */
export const CONDITIONS_WITH_CRITICALITY: ItemConditionEnum[] = [
  ItemConditionEnum.FAILURE,
  ItemConditionEnum.BAD_STATE,
  ItemConditionEnum.DEFICIENT
];

/**
 * Condiciones válidas para servicio de levantamiento (sin criticidad)
 */
export const VALID_CONDITIONS_FOR_RAISE: ItemConditionEnum[] = [
  ItemConditionEnum.OPERATIONAL,
  ItemConditionEnum.OK
];

/**
 * Verifica si una condición requiere criticidad
 */
export function requiresCriticality(condition: ItemConditionEnum | null | undefined): boolean {
  if (!condition) return false;
  return CONDITIONS_WITH_CRITICALITY.includes(condition);
}

/**
 * Verifica si un item está completado (tiene condición y criticidad si aplica)
 */
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

/**
 * Verifica si un item es válido para levantamiento de observaciones
 * ✅ ACTUALIZADO: Acepta undefined
 */
export function isValidForRaiseObservation(
  condition: ItemConditionEnum | null | undefined,
  criticality: CriticalityEnum | null | undefined
): boolean {
  if (!condition) return false;
  return VALID_CONDITIONS_FOR_RAISE.includes(condition) && (criticality === null || criticality === undefined);
}

/**
 * Labels de condiciones en español
 */
export const CONDITION_LABELS: Record<ItemConditionEnum, string> = {
  [ItemConditionEnum.OPERATIONAL]: 'Operativo',
  [ItemConditionEnum.FAILURE]: 'Falla',
  [ItemConditionEnum.BAD_STATE]: 'Mal Estado',
  [ItemConditionEnum.MISSING]: 'Falta',
  [ItemConditionEnum.OK]: 'OK',
  [ItemConditionEnum.DEFICIENT]: 'Deficiente'
};

/**
 * Labels de criticidad en español
 */
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

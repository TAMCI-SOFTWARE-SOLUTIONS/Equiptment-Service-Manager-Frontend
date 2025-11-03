import { ItemConditionEnum } from '../../../shared/model/enums/item-condition.enum';
import { CriticalityEnum } from '../../../shared/model/enums/criticality.enum';
import { ItemInspectionWithComparison } from '../model/interfaces/item-inspection-with-comparison.interface';


export type ChangeType = 'improved' | 'degraded' | 'neutral' | 'none';

export interface ComparisonDisplay {
  previous: string;
  current: string;
  hasChange: boolean;
  changeType: ChangeType;
  icon: string;
  colorClass: string;
}


export function hasItemChanged(inspection: ItemInspectionWithComparison): boolean {
  // Si no hay previousTag, significa que no hay datos previos
  if (inspection.previousTag === null) {
    return false;
  }

  return (
    inspection.previousTag !== inspection.tag ||
    inspection.previousBrandId !== inspection.brandId ||
    inspection.previousModelId !== inspection.modelId ||
    inspection.previousDescriptionId !== inspection.descriptionId ||
    inspection.previousCondition !== inspection.condition ||
    inspection.previousCriticality !== inspection.criticality
  );
}


export function getConditionChangeType(
  previous: ItemConditionEnum | null,
  current: ItemConditionEnum | null
): ChangeType {
  if (previous === current || previous === null) {
    return 'none';
  }

  const betterConditions = [
    ItemConditionEnum.OPERATIONAL,
    ItemConditionEnum.OK
  ];

  const worseConditions = [
    ItemConditionEnum.FAILURE,
    ItemConditionEnum.BAD_STATE,
    ItemConditionEnum.DEFICIENT
  ];

  const wasBad = worseConditions.includes(previous);
  const isGood = current && betterConditions.includes(current);
  const wasGood = betterConditions.includes(previous);
  const isBad = current && worseConditions.includes(current);

  if (wasBad && isGood) return 'improved';
  if (wasGood && isBad) return 'degraded';

  return 'neutral';
}


export function getCriticalityChangeType(
  previous: CriticalityEnum | null,
  current: CriticalityEnum | null
): ChangeType {
  if (previous === current || previous === null) {
    return 'none';
  }

  // De crítico a no crítico = mejora
  if (previous === CriticalityEnum.CRITICAL && current === CriticalityEnum.NOT_CRITICAL) {
    return 'improved';
  }

  // De no crítico a crítico = empeoramiento
  if (previous === CriticalityEnum.NOT_CRITICAL && current === CriticalityEnum.CRITICAL) {
    return 'degraded';
  }

  return 'neutral';
}

export function calculateItemChangeType(inspection: ItemInspectionWithComparison): ChangeType {
  if (!hasItemChanged(inspection)) {
    return 'none';
  }

  // Prioridad 1: Cambio en condición
  if (inspection.previousCondition !== inspection.condition) {
    const conditionChange = getConditionChangeType(
      inspection.previousCondition,
      inspection.condition
    );
    if (conditionChange !== 'none') {
      return conditionChange;
    }
  }

  // Prioridad 2: Cambio en criticidad
  if (inspection.previousCriticality !== inspection.criticality) {
    const criticalityChange = getCriticalityChangeType(
      inspection.previousCriticality,
      inspection.criticality
    );
    if (criticalityChange !== 'none') {
      return criticalityChange;
    }
  }

  // Prioridad 3: Cualquier otro cambio (tag, brand, etc.)
  return 'neutral';
}


export function formatFieldComparison(
  previousValue: string | null,
  currentValue: string,
  fieldType: 'condition' | 'criticality' | 'text' = 'text'
): ComparisonDisplay {
  const hasChange = previousValue !== null && previousValue !== currentValue;

  if (!hasChange) {
    return {
      previous: currentValue,
      current: currentValue,
      hasChange: false,
      changeType: 'none',
      icon: '',
      colorClass: 'gray'
    };
  }

  // Determinar tipo de cambio según el campo
  let changeType: ChangeType = 'neutral';

  if (fieldType === 'condition') {
    changeType = getConditionChangeType(
      previousValue as ItemConditionEnum,
      currentValue as ItemConditionEnum
    );
  } else if (fieldType === 'criticality') {
    changeType = getCriticalityChangeType(
      previousValue as CriticalityEnum,
      currentValue as CriticalityEnum
    );
  }

  return {
    previous: previousValue!,
    current: currentValue,
    hasChange: true,
    changeType,
    icon: changeType === 'improved' ? 'pi-arrow-up' :
      changeType === 'degraded' ? 'pi-arrow-down' : 'pi-arrow-right',
    colorClass: changeType === 'improved' ? 'green' :
      changeType === 'degraded' ? 'red' : 'sky'
  };
}


export function getChangeTypeLabel(changeType: ChangeType): string {
  const labels: Record<ChangeType, string> = {
    improved: 'Mejorado',
    degraded: 'Deteriorado',
    neutral: 'Modificado',
    none: ''
  };
  return labels[changeType];
}


export function getChangeTypeIcon(changeType: ChangeType): string {
  const icons: Record<ChangeType, string> = {
    improved: 'pi-check-circle',
    degraded: 'pi-exclamation-triangle',
    neutral: 'pi-info-circle',
    none: ''
  };
  return icons[changeType];
}

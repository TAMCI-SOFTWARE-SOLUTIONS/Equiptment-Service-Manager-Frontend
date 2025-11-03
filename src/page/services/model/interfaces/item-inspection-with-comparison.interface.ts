import { ItemConditionEnum } from '../../../../shared/model/enums/item-condition.enum';
import { CriticalityEnum } from '../../../../shared/model/enums/criticality.enum';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';

export interface ItemInspectionWithComparison {
  id: string;
  itemId: string;

  condition: ItemConditionEnum | null;
  criticality: CriticalityEnum | null;
  observation: string | null;

  tag: string;
  type: InspectableItemTypeEnum;
  brandId: string;
  modelId: string;
  descriptionId: string;
  brandName: string;
  modelName: string;
  descriptionName: string;

  previousTag: string | null;
  previousBrandId: string | null;
  previousModelId: string | null;
  previousDescriptionId: string | null;
  previousCondition: ItemConditionEnum | null;
  previousCriticality: CriticalityEnum | null;
  previousObservation: string | null;

  previousBrandName?: string;
  previousModelName?: string;
  previousDescriptionName?: string;

  hasChanges: boolean;
  changeType: 'improved' | 'degraded' | 'neutral' | 'none';
}

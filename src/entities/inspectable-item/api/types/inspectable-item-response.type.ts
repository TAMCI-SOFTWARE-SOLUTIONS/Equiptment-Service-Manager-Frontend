import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';

export interface InspectableItemResponse {
  id: string | null;
  tag: string | null;
  type: string | null;
  brandId: string | null;
  modelId: string | null;
  descriptionId: string | null;
  currentCondition: ItemConditionEnum | null;
  currentCriticality: CriticalityEnum | null;
  lastObservation: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

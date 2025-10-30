import { InspectableItemTypeEnum } from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';

export interface InspectableItemEntity {
  id: string;
  tag: string;
  type: InspectableItemTypeEnum;
  brandId: string;
  modelId: string;
  descriptionId: string;
  currentCondition: ItemConditionEnum | null;
  currentCriticality: CriticalityEnum | null;
  lastObservation: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

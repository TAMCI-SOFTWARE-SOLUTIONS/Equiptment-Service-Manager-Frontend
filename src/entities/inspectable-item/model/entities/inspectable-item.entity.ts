import { InspectableItemTypeEnum } from '../../../../shared/model/enums';
import {CriticalityEnum, ItemConditionEnum} from '../../../item-inspection';

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

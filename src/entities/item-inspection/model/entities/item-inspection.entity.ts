import { ItemConditionEnum } from '../enums/item-condition.enum';
import { CriticalityEnum } from '../enums/criticality.enum';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';

export interface ItemInspectionEntity {
  id: string;
  itemId: string;
  itemType: InspectableItemTypeEnum;
  condition: ItemConditionEnum;
  observation: string;
  criticality: CriticalityEnum | null;
}

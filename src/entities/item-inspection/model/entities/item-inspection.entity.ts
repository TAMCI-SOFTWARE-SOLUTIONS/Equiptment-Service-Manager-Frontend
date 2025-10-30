import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';

export interface ItemInspectionEntity {
  id: string;
  itemId: string;
  itemType: InspectableItemTypeEnum;
  condition: ItemConditionEnum;
  observation: string;
  criticality: CriticalityEnum | null;
}

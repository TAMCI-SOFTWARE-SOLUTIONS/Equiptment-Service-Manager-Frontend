import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';

export interface ItemInspectionEntity {
  id: string;
  itemId: string;
  itemType: InspectableItemTypeEnum;
  condition: ItemConditionEnum | null;
  criticality: CriticalityEnum | null;
  observation: string | null;
  previousTag: string | null;
  previousBrandId: string | null;
  previousModelId: string | null;
  previousDescriptionId: string | null;
  previousCondition: ItemConditionEnum | null;
  previousCriticality: CriticalityEnum | null;
  previousObservation: string | null;
}

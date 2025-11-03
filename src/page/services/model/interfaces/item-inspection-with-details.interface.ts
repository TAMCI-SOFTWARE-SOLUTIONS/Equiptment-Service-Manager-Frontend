import { ItemConditionEnum } from '../../../../shared/model/enums/item-condition.enum';
import { CriticalityEnum } from '../../../../shared/model/enums/criticality.enum';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';

export interface ItemInspectionWithDetails {
  id: string;
  itemId: string;
  condition: ItemConditionEnum | null;
  criticality: CriticalityEnum | null;
  observation: string | null;

  tag: string;
  type: InspectableItemTypeEnum;
  brandName: string;
  modelName: string;
  descriptionName: string;

  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

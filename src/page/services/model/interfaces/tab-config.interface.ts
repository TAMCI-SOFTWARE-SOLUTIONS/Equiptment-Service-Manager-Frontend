import { InspectableItemTypeEnum } from '../../../../shared/model/enums';

export interface TabConfig {
  type: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: string;
}

export interface TabProgress {
  completed: number;
  total: number;
  percentage: number;
}

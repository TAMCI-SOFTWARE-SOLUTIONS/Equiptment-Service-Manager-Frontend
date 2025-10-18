import {PowerDistributionPanelTypeEnum} from '../enums/power-distribution-panel-type.enum';

export interface PowerDistributionPanelEntity {
  id: string;
  code: string;
  type: PowerDistributionPanelTypeEnum;
}

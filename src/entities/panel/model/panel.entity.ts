import {PanelStatusEnum} from './panel-status.enum';

export interface PanelEntity {
  id: string;
  plantId: string;
  tag: string;
  areaId: string;
  locationId: string;
  communicationProtocolId: string | null;
  communicationProtocol: string;
  panelTypeId: string | null;
  panelType: string;
  status: PanelStatusEnum;
  createdAt: Date;
  updatedAt: Date | null;
  lastServiceAt: Date | null;
}

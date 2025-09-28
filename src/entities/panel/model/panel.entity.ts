import {PanelStatusEnum} from './panel-status.enum';

export interface PanelEntity {
  id: string;
  plantId: string;
  tag: string;
  areaId: string;
  communicationProtocol: string;
  panelType: string;
  location: string;
  status: PanelStatusEnum;
  createdAt: Date;
  updatedAt: Date | null;
  lastServiceAt: Date | null;
}

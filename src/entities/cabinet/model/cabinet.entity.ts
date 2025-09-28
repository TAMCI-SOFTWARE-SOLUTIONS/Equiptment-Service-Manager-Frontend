import {CabinetStatusEnum} from './cabinet-status.enum';

export interface CabinetEntity {
  id: string;
  plantId: string;
  tag: string;
  areaId: string;
  communicationProtocol: string;
  cabinetType: string;
  location: string;
  status: CabinetStatusEnum;
  createdAt: Date;
  updatedAt: Date | null;
  lastServiceAt: Date | null;
}

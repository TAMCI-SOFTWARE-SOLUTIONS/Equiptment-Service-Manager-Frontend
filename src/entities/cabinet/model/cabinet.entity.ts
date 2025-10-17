import {CabinetStatusEnum} from './cabinet-status.enum';

export interface CabinetEntity {
  id: string;
  clientId: string;
  plantId: string;
  tag: string;
  areaId: string;
  locationId: string;
  communicationProtocolId: string | null;
  communicationProtocol: string;
  cabinetTypeId: string | null;
  cabinetType: string;
  status: CabinetStatusEnum;
  createdAt: Date;
  updatedAt: Date | null;
  lastServiceAt: Date | null;
}

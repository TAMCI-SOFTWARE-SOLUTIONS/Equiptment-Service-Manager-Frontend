import {CabinetStatusEnum} from './cabinet-status.enum';

export interface CabinetEntity {
  id: string;
  clientId: string;
  plantId: string;
  tag: string;
  areaId: string;
  locationId: string;
  referenceLocation: string;
  communicationProtocolId: string | null;
  communicationProtocol: string;
  cabinetTypeId: string | null;
  cabinetType: string;
  status: CabinetStatusEnum;
  createdAt: Date;
  updatedAt: Date | null;
  lastInspectionAt: Date | null;
  lastMaintenanceAt: Date | null;
  lastRaiseObservationsAt: Date | null;
}

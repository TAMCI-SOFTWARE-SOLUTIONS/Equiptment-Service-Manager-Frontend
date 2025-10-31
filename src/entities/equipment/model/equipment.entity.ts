import { CabinetEntity } from '../../cabinet/model';
import { PanelEntity } from '../../panel/model';
import {EquipmentStatusEnum} from './equipment-status.enum';
import {EquipmentTypeEnum} from '../../../shared/model';

/**
 * Unified Equipment Entity
 * Represents both Cabinet and Panel types
 */
export interface EquipmentEntity {
  // Core fields
  id: string;
  type: EquipmentTypeEnum;
  tag: string;
  status: EquipmentStatusEnum;

  // Location IDs
  clientId: string;
  plantId: string;
  areaId: string;
  locationId: string;

  // Location Names (lazy loaded)
  plantName?: string;
  areaName?: string;
  locationName?: string;
  referenceLocation?: string;

  // Type-specific
  communicationProtocolId: string | null;
  communicationProtocol: string | null;
  equipmentTypeId: string | null;  // cabinetTypeId or panelTypeId
  equipmentTypeCode: string | null; // cabinetType or panelType
  equipmentTypeName?: string | null; // Lazy loaded type name

  // Timestamps
  createdAt: Date;
  updatedAt: Date | null;
  lastInspectionAt: Date | null;
  lastMaintenanceAt: Date | null;
  lastRaiseObservationsAt: Date | null;
}

/**
 * Helper to convert Cabinet to Equipment
 */
export function cabinetToEquipment(cabinet: CabinetEntity): EquipmentEntity {
  return {
    id: cabinet.id,
    clientId: cabinet.clientId,
    type: EquipmentTypeEnum.CABINET,
    tag: cabinet.tag,
    status: cabinet.status as unknown as EquipmentStatusEnum,
    plantId: cabinet.plantId,
    areaId: cabinet.areaId,
    locationId: cabinet.locationId,
    referenceLocation: cabinet.referenceLocation,
    communicationProtocolId: cabinet.communicationProtocolId,
    communicationProtocol: cabinet.communicationProtocol,
    equipmentTypeId: cabinet.cabinetTypeId,
    equipmentTypeCode: cabinet.cabinetType,
    createdAt: cabinet.createdAt,
    updatedAt: cabinet.updatedAt,
    lastInspectionAt: cabinet.lastInspectionAt,
    lastMaintenanceAt: cabinet.lastMaintenanceAt,
    lastRaiseObservationsAt: cabinet.lastRaiseObservationsAt,
  };
}

/**
 * Helper to convert Panel to Equipment
 */
export function panelToEquipment(panel: PanelEntity): EquipmentEntity {
  return {
    id: panel.id,
    clientId: panel.clientId,
    type: EquipmentTypeEnum.PANEL,
    tag: panel.tag,
    status: panel.status as unknown as EquipmentStatusEnum,
    plantId: panel.plantId,
    areaId: panel.areaId,
    locationId: panel.locationId,
    referenceLocation: panel.referenceLocation,
    communicationProtocolId: panel.communicationProtocolId,
    communicationProtocol: panel.communicationProtocol,
    equipmentTypeId: panel.panelTypeId,
    equipmentTypeCode: panel.panelType,
    createdAt: panel.createdAt,
    updatedAt: panel.updatedAt,
    lastInspectionAt: panel.lastInspectionAt,
    lastMaintenanceAt: panel.lastMaintenanceAt,
    lastRaiseObservationsAt: panel.lastRaiseObservationsAt,
  };
}

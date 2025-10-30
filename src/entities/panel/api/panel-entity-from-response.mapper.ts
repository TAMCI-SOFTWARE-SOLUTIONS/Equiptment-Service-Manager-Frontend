import { PanelEntity } from '../model';
import { PanelResponseDto } from './panel-response.dto';
import { PanelStatusEnum } from '../model';

export class PanelEntityFromResponseMapper {
  static fromDtoToEntity(dto: PanelResponseDto): PanelEntity {
    return {
      id: dto.id ?? '',
      clientId: dto.clientId ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      locationId: dto.locationId ?? '',
      referenceLocation: dto.referenceLocation ?? '',
      communicationProtocolId: null,
      communicationProtocol: dto.communicationProtocol ?? '',
      panelTypeId: null,
      panelType: dto.panelType ?? '',
      status: this.mapStatusStringToEnum(dto.status ?? ''),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastInspectionAt: dto.lastInspectionAt ? new Date(dto.lastInspectionAt) : null,
      lastMaintenanceAt: dto.lastMaintenanceAt ? new Date(dto.lastMaintenanceAt) : null,
      lastRaiseObservationsAt: dto.lastRaiseObservationsAt ? new Date(dto.lastRaiseObservationsAt) : null,
    };
  }

  private static mapStatusStringToEnum(status: string): PanelStatusEnum {
    const validStatuses = Object.values(PanelStatusEnum) as string[];

    if (validStatuses.includes(status.toUpperCase())) {
      return status.toUpperCase() as PanelStatusEnum;
    }

    console.warn(`Invalid panel status received: ${status}, defaulting to OPERATIVE`);
    return PanelStatusEnum.OPERATIVE;
  }
}

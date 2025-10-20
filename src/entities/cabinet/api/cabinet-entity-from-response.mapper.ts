import { CabinetEntity } from '../model';
import { CabinetResponseDto } from './cabinet-response.dto';
import { CabinetStatusEnum } from '../model';

export class CabinetEntityFromResponseMapper {
  static fromDtoToEntity(dto: CabinetResponseDto): CabinetEntity {
    return {
      id: dto.id ?? '',
      clientId: dto.clientId ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      locationId: dto.locationId ?? '',
      referenceLocation: dto.referenceLocation ?? '',
      communicationProtocol: dto.communicationProtocol ?? '',
      communicationProtocolId: null,
      cabinetType: dto.cabinetType ?? '',
      cabinetTypeId: null,
      status: this.mapStatusStringToEnum(dto.status ?? ''),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastServiceAt: dto.lastServiceAt ? new Date(dto.lastServiceAt) : null
    };
  }

  private static mapStatusStringToEnum(status: string): CabinetStatusEnum {
    const validStatuses = Object.values(CabinetStatusEnum) as string[];

    if (validStatuses.includes(status.toUpperCase())) {
      return status.toUpperCase() as CabinetStatusEnum;
    }

    console.warn(`Invalid cabinet status received: ${status}, defaulting to OPERATIVE`);
    return CabinetStatusEnum.OPERATIVE;
  }
}

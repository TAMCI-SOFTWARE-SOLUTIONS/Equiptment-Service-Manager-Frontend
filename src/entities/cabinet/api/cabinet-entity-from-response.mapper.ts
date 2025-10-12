import { CabinetEntity } from '../model';
import { CabinetResponseDto } from './cabinet-response.dto';
import { CabinetStatusEnum } from '../model';

/**
 * Mapper class for converting CabinetResponseDto to CabinetEntity
 * Used when receiving data from backend
 */
export class CabinetEntityFromResponseMapper {

  /**
   * Converts a CabinetResponseDto to CabinetEntity
   *
   * @param dto The response DTO to convert
   * @returns CabinetEntity
   */
  static fromDtoToEntity(dto: CabinetResponseDto): CabinetEntity {
    return {
      id: dto.id ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      communicationProtocol: dto.communicationProtocol ?? '',
      cabinetType: dto.cabinetType ?? '',
      location: dto.location ?? '',
      status: this.mapStatusStringToEnum(dto.status ?? ''),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastServiceAt: dto.lastServiceAt ? new Date(dto.lastServiceAt) : null
    };
  }

  /**
   * Maps status string from backend to CabinetStatusEnum
   *
   * @param status String status from backend
   * @returns CabinetStatusEnum
   */
  private static mapStatusStringToEnum(status: string): CabinetStatusEnum {
    const validStatuses = Object.values(CabinetStatusEnum) as string[];

    if (validStatuses.includes(status.toUpperCase())) {
      return status.toUpperCase() as CabinetStatusEnum;
    }

    console.warn(`Invalid cabinet status received: ${status}, defaulting to OPERATIVE`);
    return CabinetStatusEnum.OPERATIVE;
  }
}

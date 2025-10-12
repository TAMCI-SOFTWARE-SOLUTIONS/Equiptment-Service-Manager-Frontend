import { PanelEntity } from '../model';
import { PanelResponseDto } from './panel-response.dto';
import { PanelStatusEnum } from '../model/panel-status.enum';

/**
 * Mapper class for converting PanelResponseDto to PanelEntity
 * Used when receiving data from backend
 */
export class PanelEntityFromResponseMapper {

  /**
   * Converts a PanelResponseDto to PanelEntity
   *
   * @param dto The response DTO to convert
   * @returns PanelEntity
   */
  static fromDtoToEntity(dto: PanelResponseDto): PanelEntity {
    return {
      id: dto.id ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      communicationProtocol: dto.communicationProtocol ?? '',
      panelType: dto.panelType ?? '',
      location: dto.location ?? '',
      status: this.mapStatusStringToEnum(dto.status ?? ''),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastServiceAt: dto.lastServiceAt ? new Date(dto.lastServiceAt) : null
    };
  }

  /**
   * Maps status string from backend to PanelStatusEnum
   *
   * @param status String status from backend
   * @returns PanelStatusEnum
   */
  private static mapStatusStringToEnum(status: string): PanelStatusEnum {
    const validStatuses = Object.values(PanelStatusEnum) as string[];

    if (validStatuses.includes(status.toUpperCase())) {
      return status.toUpperCase() as PanelStatusEnum;
    }

    console.warn(`Invalid panel status received: ${status}, defaulting to OPERATIVE`);
    return PanelStatusEnum.OPERATIVE;
  }
}

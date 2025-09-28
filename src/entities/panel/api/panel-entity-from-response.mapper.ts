import {PanelEntity, PanelStatusEnum} from '../model';
import {PanelResponseDto} from './panel-response.dto';
import {EnumMapper} from '../../../shared/utils';

export class PanelEntityFromResponseMapper {
  static fromDtoToEntity(dto: PanelResponseDto): PanelEntity {
    return {
      id: dto.id ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      communicationProtocol: dto.communicationProtocol ?? '',
      panelType: dto.panelType ?? '',
      location: dto.location ?? '',
      status: EnumMapper.stringToEnum(PanelStatusEnum, dto.status) ?? PanelStatusEnum.RETIRED,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastServiceAt: dto.lastServiceAt ? new Date(dto.lastServiceAt) : null,
    }
  }
}

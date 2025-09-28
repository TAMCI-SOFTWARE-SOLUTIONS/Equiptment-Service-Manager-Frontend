import {CabinetResponseDto} from './cabinet-response.dto';
import {CabinetEntity, CabinetStatusEnum} from '../model';
import {EnumMapper} from '../../../shared/utils';

export class CabinetEntityFromResponseMapper {
  static fromDtoToEntity(dto: CabinetResponseDto): CabinetEntity {
    return {
      id: dto.id ?? '',
      plantId: dto.plantId ?? '',
      tag: dto.tag ?? '',
      areaId: dto.areaId ?? '',
      communicationProtocol: dto.communicationProtocol ?? '',
      cabinetType: dto.cabinetType ?? '',
      location: dto.location ?? '',
      status: EnumMapper.stringToEnum(CabinetStatusEnum, dto.status) ?? CabinetStatusEnum.RETIRED,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
      lastServiceAt: dto.lastServiceAt ? new Date(dto.lastServiceAt) : null,
    }
  }
}

import {ProjectResponseDto} from './project-response.dto';
import {ProjectEntity} from '../model/project.entity';
import {ProjectStatusEnum} from '../model/project-status.enum';
import {EnumMapper} from '../../../shared/utils';
import {EquipmentTypeEnum} from '../../../shared/model';

export class ProjectEntityFromResponseMapper {
  static fromDtoToEntity(dto: ProjectResponseDto): ProjectEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      description: dto.description ?? '',
      clientId: dto.clientId ?? '',
      bannerId: dto.bannerId ?? null,
      startAt: dto.startedAt ? new Date(dto.startedAt) : null,
      completionAt: dto.completeAt ? new Date(dto.completeAt) : null,
      cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : null,
      status: EnumMapper.stringToEnum(ProjectStatusEnum, dto.status) ?? ProjectStatusEnum.PLANNED,
      allowedEquipmentTypes: dto.allowedEquipmentTypes?.map(type => EnumMapper.stringToEnum(EquipmentTypeEnum, type) ?? EquipmentTypeEnum.CABINET) ?? []
    }
  }
}

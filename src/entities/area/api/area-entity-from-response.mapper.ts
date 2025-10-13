import {AreaEntity} from '../model';
import {AreaResponseDto} from './area-response.dto';
import {EnumMapper} from '../../../shared/utils';
import {EquipmentTypeEnum} from '../../../shared/model';

export class AreaEntityFromResponseMapper {
  static fromDtoToEntity(dto: AreaResponseDto): AreaEntity {
   return {
      id: dto.id ?? '',
      plantId: '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      allowedEquipmentTypes: dto.allowedEquipmentTypes?.map(type => EnumMapper.stringToEnum(EquipmentTypeEnum, type) ?? EquipmentTypeEnum.CABINET) ?? []
   }
  }
}

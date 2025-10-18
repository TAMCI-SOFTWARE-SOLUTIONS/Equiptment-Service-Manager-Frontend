import {AreaEntity} from '../model';
import {AreaResponseDto} from './area-response.dto';
import {EquipmentTypeMapper} from '../../project/api';

export class AreaEntityFromResponseMapper {
  static fromDtoToEntity(dto: AreaResponseDto): AreaEntity {
   return {
      id: dto.id ?? '',
      plantId: '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      allowedEquipmentTypes: dto.allowedEquipmentTypes ? dto.allowedEquipmentTypes.map(type => EquipmentTypeMapper.fromStringToEnum(type)) : [],
   }
  }
}

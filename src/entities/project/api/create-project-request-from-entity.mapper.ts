import {ProjectEntity} from '../model/project.entity';
import {CreateProjectRequest} from './create-project-request.type';
import {EquipmentTypeMapper} from './equipment-type.mapper';

export class CreateProjectRequestFromEntityMapper {
  static fromEntityToDto(entity: ProjectEntity): CreateProjectRequest {
    return {
      name: entity.name,
      code: entity.code,
      description: entity.description,
      clientId: entity.clientId,
      bannerId: entity.bannerId,

      allowedEquipmentTypes: EquipmentTypeMapper.fromEnumArrayToStringArray(
        entity.allowedEquipmentTypes
      ),
    };
  }
}

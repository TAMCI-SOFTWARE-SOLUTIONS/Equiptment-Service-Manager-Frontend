import { ProjectEntity } from '../model/project.entity';
import { UpdateProjectRequest } from './update-project-request.type';

export class UpdateProjectRequestFromEntityMapper {
  static fromEntityToDto(entity: ProjectEntity): UpdateProjectRequest {
    return {
      name: entity.name,
      description: entity.description,
      bannerId: entity.bannerId,
      allowedEquipmentTypes: entity.allowedEquipmentTypes.map(type => type.toString())
    };
  }
}

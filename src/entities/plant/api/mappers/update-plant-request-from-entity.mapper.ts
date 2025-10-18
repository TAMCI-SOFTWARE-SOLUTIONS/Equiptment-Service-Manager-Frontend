import {UpdatePlantRequest} from '../types/update-plant-request.type';
import {PlantEntity} from '../../model';

export class UpdatePlantRequestFromEntityMapper {
  static fromEntityToDto(entity: PlantEntity): UpdatePlantRequest {
    return {
      name: entity.name,
    };
  }
}

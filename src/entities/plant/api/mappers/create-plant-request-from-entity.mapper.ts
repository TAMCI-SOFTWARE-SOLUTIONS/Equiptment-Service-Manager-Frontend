import { PlantEntity } from '../../model';
import { CreatePlantRequest } from '../types/create-plant-request.type';

export class CreatePlantRequestFromEntityMapper {
  static fromEntityToDto(entity: PlantEntity): CreatePlantRequest {
    return {
      clientId: entity.clientId,
      name: entity.name,
    };
  }
}

import { PlantResponse } from '../types/plant-response.type';
import { PlantEntity } from '../../model';

export class PlantEntityFromResponseMapper {
  static fromDtoToEntity(dto: PlantResponse): PlantEntity {
    return {
      id: dto.id ?? '',
      clientId: dto.clientId ?? '',
      name: dto.name ?? '',
    };
  }
}

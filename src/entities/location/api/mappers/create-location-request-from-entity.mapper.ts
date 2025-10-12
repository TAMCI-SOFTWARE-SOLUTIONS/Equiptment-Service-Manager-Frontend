import { LocationEntity } from '../../model';
import { CreateLocationRequest } from '../types/create-location-request.type';

export class CreateLocationRequestFromEntityMapper {
  static fromEntityToDto(entity: LocationEntity): CreateLocationRequest {
    return {
      areaId: entity.areaId,
      name: entity.name,
      code: entity.code,
    };
  }
}

import {UpdateLocationRequest} from '../types/update-location-request.type';
import {LocationEntity} from '../../model';

export class UpdateLocationRequestFromEntityMapper {
  static fromEntityToDto(entity: LocationEntity): UpdateLocationRequest {
    return {
      name: entity.name,
      code: entity.code,
    };
  }
}

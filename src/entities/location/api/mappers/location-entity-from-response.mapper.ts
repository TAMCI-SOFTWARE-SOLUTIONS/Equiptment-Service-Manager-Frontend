import { LocationResponse } from '../types/location-response.type';
import { LocationEntity } from '../../model';

export class LocationEntityFromResponseMapper {
  static fromDtoToEntity(dto: LocationResponse): LocationEntity {
    return {
      id: dto.id ?? '',
      areaId: '',
      name: dto.name ?? '',
      code: dto.code ?? '',
    };
  }
}

import {CabinetTypeResponseDto} from './cabinet-type-response.dto';
import {CabinetTypeEntity} from '../model';

export class CabinetTypeFromResponseMapper {
  static fromDtoToEntity(dto: CabinetTypeResponseDto): CabinetTypeEntity {
    return {
      id: dto.id ?? '',
      code: dto.code ?? '',
      name: dto.name ?? '',
    }
  }
}

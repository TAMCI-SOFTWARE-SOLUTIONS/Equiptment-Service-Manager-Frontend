import {PanelTypeEntity} from '../model';
import {PanelTypeResponseDto} from './panel-type-response.dto';

export class PanelTypeFromResponseMapper {
  static fromDtoToEntity(dto: PanelTypeResponseDto): PanelTypeEntity {
    return {
      id: dto.id ?? '',
      code: dto.code ?? '',
      name: dto.name ?? '',
    }
  }
}

import {PanelTypeResponseDto} from './panel-type-response.dto';
import {PanelTypeEntity} from '../model/panel-type.entity';

export class PanelTypeFromResponseMapper {
  static fromDtoToEntity(dto: PanelTypeResponseDto): PanelTypeEntity {
    return {
      id: dto.id ?? '',
      code: dto.code ?? '',
      name: dto.name ?? '',
    }
  }
}

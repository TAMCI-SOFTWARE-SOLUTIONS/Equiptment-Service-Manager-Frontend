import { ModelResponse } from '../types/model-response.type';
import { ModelEntity } from '../../model/entities/model.entity';

export class ModelEntityFromResponseMapper {
  static fromDtoToEntity(dto: ModelResponse): ModelEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      brandId: '',
    };
  }
}

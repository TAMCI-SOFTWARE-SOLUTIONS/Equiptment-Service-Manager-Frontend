import { ModelEntity } from '../../model/entities/model.entity';
import { CreateModelRequest } from '../types/create-model-request.type';

export class CreateModelRequestFromEntityMapper {
  static fromEntityToDto(entity: ModelEntity): CreateModelRequest {
    return {
      name: entity.name,
      brandId: entity.brandId,
    };
  }
}

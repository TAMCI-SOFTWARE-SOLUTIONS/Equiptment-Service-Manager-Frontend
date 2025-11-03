import { ModelEntity } from '../../model/entities/model.entity';
import { UpdateModelRequest } from '../types/update-model-request.type';

export class UpdateModelRequestFromEntityMapper {
  static fromEntityToDto(entity: ModelEntity): UpdateModelRequest {
    return {
      name: entity.name,
    };
  }
}

import { ItemInspectionEntity } from '../../model';
import { CreateItemInspectionRequest } from '../types/create-item-inspection-request.type';

export class CreateItemInspectionRequestFromEntityMapper {
  static fromEntityToDto(entity: ItemInspectionEntity): CreateItemInspectionRequest {
    return {
      serviceId: '', // This would need to be provided from context
      itemId: entity.itemId,
      itemType: entity.itemType.toString(),
      condition: entity.condition?.toString() ?? null,
      criticality: entity.criticality?.toString() ?? null,
      observation: entity.observation,
    };
  }
}

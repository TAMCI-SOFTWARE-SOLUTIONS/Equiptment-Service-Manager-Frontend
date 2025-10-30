import { ItemInspectionEntity } from '../../model';
import { UpdateItemInspectionRequest } from '../types/update-item-inspection-request.type';

export class UpdateItemInspectionRequestFromEntityMapper {
  static fromEntityToDto(entity: ItemInspectionEntity): UpdateItemInspectionRequest {
    return {
      condition: entity.condition?.toString() ?? null,
      observation: entity.observation,
      criticality: entity.criticality?.toString() ?? null,
    };
  }
}

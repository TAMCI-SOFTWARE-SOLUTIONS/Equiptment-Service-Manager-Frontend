import { EquipmentServiceEntity } from '../../model/entities/equipment-service.entity';
import { CreateEquipmentServiceRequest } from '../types/create-equipment-service-request.type';

export class CreateEquipmentServiceRequestFromEntityMapper {
  static fromEntityToDto(entity: EquipmentServiceEntity): CreateEquipmentServiceRequest {
    return {
      operatorId: entity.operatorId,
      projectId: entity.projectId,
      equipmentId: entity.equipmentId,
      equipmentType: entity.equipmentType,
      supervisorId: entity.supervisorId,
      type: entity.type,
    };
  }
}

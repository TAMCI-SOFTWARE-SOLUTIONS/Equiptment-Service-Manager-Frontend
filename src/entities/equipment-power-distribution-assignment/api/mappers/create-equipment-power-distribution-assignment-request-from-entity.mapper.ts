import { EquipmentPowerDistributionAssignmentEntity } from '../../model/entities/equipment-power-distribution-assignment.entity';
import { CreateEquipmentPowerDistributionAssignmentRequest } from '../types/create-equipment-power-distribution-assignment-request.type';

export class CreateEquipmentPowerDistributionAssignmentRequestFromEntityMapper {
  static fromEntityToDto(entity: EquipmentPowerDistributionAssignmentEntity): CreateEquipmentPowerDistributionAssignmentRequest {
    return {
      equipmentId: entity.equipmentId,
      powerDistributionPanelId: entity.powerDistributionPanelId,
      circuitAssignments: entity.circuitAssignments,
    };
  }
}

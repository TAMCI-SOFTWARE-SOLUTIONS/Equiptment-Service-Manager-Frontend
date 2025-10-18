import { EquipmentPowerDistributionAssignmentResponse } from '../types/equipment-power-distribution-assignment-response.type';
import { EquipmentPowerDistributionAssignmentEntity } from '../../model/entities/equipment-power-distribution-assignment.entity';

export class EquipmentPowerDistributionAssignmentEntityFromResponseMapper {
  static fromDtoToEntity(dto: EquipmentPowerDistributionAssignmentResponse): EquipmentPowerDistributionAssignmentEntity {
    return {
      id: dto.id ?? '',
      equipmentId: dto.equipmentId ?? '',
      powerDistributionPanelId: dto.powerDistributionPanelId ?? '',
      circuitAssignments: dto.circuitAssignments
        ? dto.circuitAssignments.map((ca: any) => ca.circuitNumber || ca)
        : []
    };
  }
}

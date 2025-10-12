import { CircuitAssignmentEntity } from '../../model';
import { CreateCircuitAssignmentRequest } from '../types/create-circuit-assignment-request.type';

export class CreateCircuitAssignmentRequestFromEntityMapper {
  static fromEntityToDto(entity: CircuitAssignmentEntity): CreateCircuitAssignmentRequest {
    return {
      equipmentPowerDistributionAssignmentId: entity.equipmentPowerDistributionAssignmentId,
      circuitNumber: entity.circuitNumber,
    };
  }
}

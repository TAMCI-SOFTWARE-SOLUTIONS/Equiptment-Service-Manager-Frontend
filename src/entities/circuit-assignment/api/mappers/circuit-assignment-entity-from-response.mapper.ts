import { CircuitAssignmentResponse } from '../types/circuit-assignment-response.type';
import { CircuitAssignmentEntity } from '../../model';

export class CircuitAssignmentEntityFromResponseMapper {
  static fromDtoToEntity(dto: CircuitAssignmentResponse): CircuitAssignmentEntity {
    return {
      id: dto.id ?? '',
      circuitNumber: dto.circuitNumber ?? 0,
      equipmentPowerDistributionAssignmentId: '',
    };
  }
}

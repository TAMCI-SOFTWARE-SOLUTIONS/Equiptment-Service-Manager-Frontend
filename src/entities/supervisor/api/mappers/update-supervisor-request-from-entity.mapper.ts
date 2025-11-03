import { SupervisorEntity } from '../../model';
import { UpdateSupervisorRequest } from '../types';

export class UpdateSupervisorRequestFromEntityMapper {
  static fromEntityToDto(entity: SupervisorEntity): UpdateSupervisorRequest {
    return {
      fullName: entity.fullName,
    };
  }
}

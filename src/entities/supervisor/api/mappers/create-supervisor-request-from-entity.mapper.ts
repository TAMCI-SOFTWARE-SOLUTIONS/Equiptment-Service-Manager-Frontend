import { SupervisorEntity } from '../../model';
import { CreateSupervisorRequest } from '../types';

export class CreateSupervisorRequestFromEntityMapper {
  static fromEntityToDto(entity: SupervisorEntity): CreateSupervisorRequest {
    return {
      fullName: entity.fullName,
    };
  }
}

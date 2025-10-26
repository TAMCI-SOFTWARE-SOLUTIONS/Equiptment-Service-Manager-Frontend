import { SupervisorResponse } from '../types';
import { SupervisorEntity } from '../../model';

export class SupervisorEntityFromResponseMapper {
  static fromDtoToEntity(dto: SupervisorResponse): SupervisorEntity {
    return {
      id: dto.id ?? '',
      fullName: dto.fullName ?? '',
    };
  }
}

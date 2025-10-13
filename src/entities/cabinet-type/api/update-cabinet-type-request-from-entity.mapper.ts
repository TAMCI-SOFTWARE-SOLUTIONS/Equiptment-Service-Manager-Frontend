import {CabinetTypeEntity} from '../model';
import {UpdateCabinetTypeRequest} from './update-cabinet-type-request.type';

export class UpdateCabinetTypeRequestFromEntityMapper {
  static fromEntityToDto(entity: CabinetTypeEntity): UpdateCabinetTypeRequest {
    return {
      code: entity.code,
      name: entity.name,
    };
  }
}

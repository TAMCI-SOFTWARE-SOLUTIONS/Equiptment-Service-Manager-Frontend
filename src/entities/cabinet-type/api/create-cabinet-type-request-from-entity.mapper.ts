import {CabinetTypeEntity} from '../model';
import {CreateCabinetTypeRequest} from './create-cabinet-type-request.type';

export class CreateCabinetTypeRequestFromEntityMapper {
  static fromEntityToDto(entity: CabinetTypeEntity): CreateCabinetTypeRequest {
    return {
      code: entity.code,
      name: entity.name,
    };
  }
}

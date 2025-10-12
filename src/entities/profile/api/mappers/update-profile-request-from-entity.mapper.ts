import { ProfileEntity } from '../../model';
import { UpdateProfileRequest } from '../types';

export class UpdateProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: ProfileEntity): UpdateProfileRequest {
    return {
      names: entity.names,
      firstSurname: entity.firstSurname,
      secondSurname: entity.secondSurname,
      photoFileId: entity.photoFileId,
      gender: entity.gender,
      email: entity.email
    };
  }
}

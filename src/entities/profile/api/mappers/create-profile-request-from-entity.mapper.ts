import { ProfileEntity } from '../../model';
import { CreateProfileRequest } from '../types/create-profile-request.type';
import { GenderMapper } from './gender.mapper';

export class CreateProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: ProfileEntity): CreateProfileRequest {
    return {
      shouldCreateUser: true,
      names: entity.names,
      firstSurname: entity.firstSurname,
      secondSurname: entity.secondSurname,
      photoFileId: entity.photoFileId,
      gender: GenderMapper.mapStringToGender(entity.gender),
      email: entity.email,
    };
  }
}

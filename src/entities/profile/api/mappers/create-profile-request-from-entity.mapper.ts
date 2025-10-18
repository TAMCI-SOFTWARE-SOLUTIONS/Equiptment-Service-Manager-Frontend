import { ProfileEntity } from '../../model';
import { CreateProfileRequest } from '../types';
import { GenderMapper } from './gender.mapper';
import {IdentityDocumentTypeMapper} from './identity-document-type.mapper';

export class CreateProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: ProfileEntity): CreateProfileRequest {
    return {
      shouldCreateUser: true,
      names: entity.names,
      firstSurname: entity.firstSurname,
      secondSurname: entity.secondSurname,
      photoFileId: entity.photoFileId,
      gender: GenderMapper.mapStringToGender(entity.gender),
      identityDocumentNumber: entity.identityDocumentNumber,
      identityDocumentType: IdentityDocumentTypeMapper.mapIdentityDocumentTypeToString(entity.identityDocumentType),
      email: entity.email,
    };
  }
}

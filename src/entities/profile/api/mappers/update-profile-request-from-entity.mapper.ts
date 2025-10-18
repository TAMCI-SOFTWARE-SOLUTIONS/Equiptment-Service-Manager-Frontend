import { ProfileEntity } from '../../model';
import { UpdateProfileRequest } from '../types';
import {IdentityDocumentTypeMapper} from './identity-document-type.mapper';

export class UpdateProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: ProfileEntity): UpdateProfileRequest {
    return {
      names: entity.names,
      firstSurname: entity.firstSurname,
      secondSurname: entity.secondSurname,
      photoFileId: entity.photoFileId,
      gender: entity.gender,
      identityDocumentNumber: entity.identityDocumentNumber,
      identityDocumentType: IdentityDocumentTypeMapper.mapIdentityDocumentTypeToString(entity.identityDocumentType),
      email: entity.email
    };
  }
}

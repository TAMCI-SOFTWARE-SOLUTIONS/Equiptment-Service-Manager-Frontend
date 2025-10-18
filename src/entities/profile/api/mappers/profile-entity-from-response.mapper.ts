import { ProfileResponse } from '../types';
import { ProfileEntity } from '../../model';
import { GenderMapper } from './gender.mapper';
import {IdentityDocumentTypeMapper} from './identity-document-type.mapper';

export class ProfileEntityFromResponseMapper {
  static fromDtoToEntity(dto: ProfileResponse): ProfileEntity {
    return {
      identityDocumentNumber: dto.identityDocumentNumber ?? '',
      identityDocumentType: IdentityDocumentTypeMapper.mapStringToIdentityDocumentType(dto.identityDocumentType?? ''),
      shouldCreateUser: false,
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      names: dto.names ?? '',
      firstSurname: dto.firstSurname ?? '',
      secondSurname: dto.secondSurname ?? '',
      photoFileId: dto.photoFileId ?? '',
      email: dto.email ?? '',
      gender: GenderMapper.mapStringToGender(dto.gender ?? '')
    };
  }
}

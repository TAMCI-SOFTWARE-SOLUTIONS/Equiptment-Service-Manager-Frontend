import { ProfileResponse } from '../types/profile-response.type';
import { ProfileEntity } from '../../model';
import { GenderMapper } from './gender.mapper';

export class ProfileEntityFromResponseMapper {
  static fromDtoToEntity(dto: ProfileResponse): ProfileEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      names: dto.names ?? '',
      firstSurname: dto.firstSurname ?? '',
      secondSurname: dto.secondSurname ?? '',
      photoFileId: dto.photoFileId ?? '',
      email: dto.email ?? '',
      gender: GenderMapper.fromStringToEnum(dto.gender ?? ''),
    };
  }
}

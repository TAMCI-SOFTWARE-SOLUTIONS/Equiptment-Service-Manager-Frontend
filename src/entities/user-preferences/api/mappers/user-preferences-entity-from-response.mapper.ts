import { UserPreferencesResponse } from '../types/user-preferences-response.type';
import { UserPreferencesEntity } from '../../model/entities/user-preferences.entity';

export class UserPreferencesEntityFromResponseMapper {
  static fromDtoToEntity(dto: UserPreferencesResponse): UserPreferencesEntity {
    return {
      id: dto.id ?? null,
      userId: dto.userId ?? null,
      lastSelectedClientId: dto.lastSelectedClientId ?? null,
      lastSelectedProjectId: dto.lastSelectedProjectId ?? null
    };
  }
}

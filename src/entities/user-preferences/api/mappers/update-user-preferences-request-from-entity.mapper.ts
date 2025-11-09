import { UpdateUserPreferencesRequest } from '../types/update-user-preferences-request.type';
import { UserPreferencesEntity } from '../../model/entities/user-preferences.entity';

export class UpdateUserPreferencesRequestFromEntityMapper {
  static fromEntityToDto(entity: UserPreferencesEntity): UpdateUserPreferencesRequest {
    return {
      lastSelectedClientId: entity.lastSelectedClientId ?? null,
      lastSelectedProjectId: entity.lastSelectedProjectId ?? null
    };
  }
}

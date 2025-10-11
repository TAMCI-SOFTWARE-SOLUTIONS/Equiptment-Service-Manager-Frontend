import {UserEntity} from '../../model';
import {AuthenticatedUserResponse} from '../types/authenticated-user-response.type';
import {UserStatusFromResponseMapper} from './user-status-from-response.mapper';

export class AuthenticatedUserFromResponseMapper {
  static fromDtoToEntity(dto: AuthenticatedUserResponse): UserEntity {
    return {
      id: dto.id ?? '',
      username: dto.username ?? '',
      password: '',
      accountStatus: UserStatusFromResponseMapper.mapStringToAccountStatus(dto.status ?? ''),
      failedLoginAttempts: dto.failedLoginAttempts ?? 0,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
      passwordChangedAt: dto.passwordChangedAt ? new Date(dto.passwordChangedAt) : null,
      roles: dto.roles ? dto.roles.map(role => ({
        id: '',
        name: role as any
      })) : [],
      token: dto.token ?? '',
    };
  }
}

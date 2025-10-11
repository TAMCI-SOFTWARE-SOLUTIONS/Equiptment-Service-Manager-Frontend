import {UserEntity} from '../../model';
import {SignUpRequest} from '../types/sign-up-request.type';

export class SignUpRequestFromEntityMapper {
  static fromEntityToDto(entity: UserEntity): SignUpRequest {
    return {
      username: entity.username,
      password: entity.password,
      roles: entity.roles.map(role => role.name)
    };
  }
}

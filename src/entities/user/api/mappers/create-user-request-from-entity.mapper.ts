import {UserEntity} from '../../model';
import {CreateUserRequestType} from '../types/create-user-request.type';

export class CreateUserRequestFromEntityMapper {
  static fromEntityToDto(entity: UserEntity): CreateUserRequestType {
    return {
      email: entity.email,
      password: entity.password,
      roles: entity.roles.map(role => role.name)
    };
  }
}

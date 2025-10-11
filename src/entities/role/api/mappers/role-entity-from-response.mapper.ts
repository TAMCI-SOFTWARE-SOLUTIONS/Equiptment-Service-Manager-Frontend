import { RoleEntity } from '../../model';
import { RoleResponse } from '../types/role-response.type';
import { RolesEnum } from '../../model';

export class RoleEntityFromResponseMapper {
  static fromDtoToEntity(dto: RoleResponse): RoleEntity {
    return {
      id: dto.id ?? '',
      name: RoleEntityFromResponseMapper.mapStringToRoleEnum(dto.name ?? '')
    };
  }

  private static mapStringToRoleEnum(roleName: string): RolesEnum {
    const roleKey = Object.keys(RolesEnum).find(
      key => RolesEnum[key as keyof typeof RolesEnum] === roleName
    );

    if (roleKey) {
      return RolesEnum[roleKey as keyof typeof RolesEnum];
    }

    console.warn(`Invalid role name received: ${roleName}, defaulting to ROLE_CITIZEN`);
    return RolesEnum.ROLE_CITIZEN;
  }
}

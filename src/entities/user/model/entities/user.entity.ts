import { AccountStatusEnum } from '../enums/account-status.enum';
import {RoleEntity} from '../../../role/model';

export interface UserEntity {
  id: string;
  username: string;
  password: string;
  accountStatus: AccountStatusEnum;
  failedLoginAttempts: number;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  roles: RoleEntity[];
  token: string | null;
}

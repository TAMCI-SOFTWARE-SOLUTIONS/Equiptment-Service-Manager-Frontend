import { GenderEnum } from '../enums/gender.enum';
import {IdentityDocumentTypeEnum} from '../enums/identity-document-type.enum';

export interface ProfileEntity {
  id: string;
  userId: string;
  names: string;
  firstSurname: string;
  secondSurname: string;
  photoFileId: string | null;
  gender: GenderEnum;
  identityDocumentType: IdentityDocumentTypeEnum;
  identityDocumentNumber: string;
  shouldCreateUser: boolean;
  email: string;
}

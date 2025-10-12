import { GenderEnum } from '../enums/gender.enum';

export interface ProfileEntity {
  id: string;
  userId: string;
  names: string;
  firstSurname: string;
  secondSurname: string;
  photoFileId: string | null;
  gender: GenderEnum;
  email: string;
}

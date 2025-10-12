import { GenderEnum } from '../enums/gender.enum';

export interface ProfileEntity {
  id: string;
  userId: string;
  names: string;
  firstSurname: string;
  secondSurname: string;
  photoFileId: string;
  gender: GenderEnum;
  email: string;
}

export interface CreateProfileRequest {
  shouldCreateUser: boolean | null;
  names: string | null;
  firstSurname: string | null;
  secondSurname: string | null;
  photoFileId: string | null;
  gender: string | null;
  email: string | null;
}

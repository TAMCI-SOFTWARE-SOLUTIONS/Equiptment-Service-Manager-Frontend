export interface UpdateProfileRequest {
  names: string | null;
  firstSurname: string | null;
  secondSurname: string | null;
  photoFileId: string | null;
  gender: string | null;
  identityDocumentType: string | null;
  identityDocumentNumber: string | null;
  email: string | null;
}

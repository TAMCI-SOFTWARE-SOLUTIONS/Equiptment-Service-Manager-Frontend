export interface UpdateEquipmentServiceRequest {
  equipmentId: string | null;
  equipmentType: string | null;
  supervisorId: string | null;
  videoStartFileId: string | null;
  videoEndFileId: string | null;
  startPhotos: string[] | null;
  midPhotos: string[] | null;
  endPhotos: string[] | null;
  reportDocumentFileId: string | null;
}
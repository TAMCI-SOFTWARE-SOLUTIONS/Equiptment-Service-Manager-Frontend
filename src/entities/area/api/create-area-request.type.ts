export interface CreateAreaRequest {
  plantId: string | null;
  name: string | null;
  code: string | null;
  allowedEquipmentTypes: string[] | null;
}

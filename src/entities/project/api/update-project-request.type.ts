export interface UpdateProjectRequest {
  name: string | null;
  description: string | null;
  bannerId: string | null;
  allowedEquipmentTypes: string[] | null;
}

export interface ProjectResponseDto {
  id: string | null;
  name: string | null;
  code: string | null;
  description: string | null;
  clientId: string | null;
  bannerId: string | null;
  startedAt: string | null;
  completeAt: string | null;
  cancelledAt: string | null;
  status: string | null;
  allowedEquipmentTypes: string[] | null;
}

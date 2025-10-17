export interface CabinetResponseDto {
  id: string | null;
  clientId: string | null;
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  locationId: string | null;
  communicationProtocol: string | null;
  cabinetType: string | null;
  status: string | null;
  createdAt: string | null; // ISO string from backend
  updatedAt: string | null; // ISO string from backend
  lastServiceAt: string | null; // ISO string from backend
}

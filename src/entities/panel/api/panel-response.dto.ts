export interface PanelResponseDto {
  id: string | null;
  clientId: string | null;
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  locationId: string | null;
  referenceLocation: string | null;
  communicationProtocolId: string | null;
  communicationProtocol: string | null;
  panelTypeId: string | null;
  panelType: string | null;
  status: string | null;
  createdAt: string | null; // ISO string from backend
  updatedAt: string | null; // ISO string from backend
  lastInspectionAt: string | null; // ISO string from backend
  lastMaintenanceAt: string | null; // ISO string from backend
  lastRaiseObservationsAt: string | null; // ISO string from backend
}

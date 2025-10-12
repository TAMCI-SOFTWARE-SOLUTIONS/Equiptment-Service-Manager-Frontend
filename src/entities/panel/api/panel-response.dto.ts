/**
 * Response DTO for panel data from backend
 * Corresponds to: PanelResponse.java
 *
 * @see PanelResponse.java in backend
 */
export interface PanelResponseDto {
  id: string | null;
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  communicationProtocol: string | null;
  panelType: string | null;
  location: string | null;
  status: string | null;
  createdAt: string | null; // ISO string from backend
  updatedAt: string | null; // ISO string from backend
  lastServiceAt: string | null; // ISO string from backend
}

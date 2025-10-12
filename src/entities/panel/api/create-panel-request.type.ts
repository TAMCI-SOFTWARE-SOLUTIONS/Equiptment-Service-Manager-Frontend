/**
 * Request DTO for creating a new panel
 * Corresponds to: CreatePanelResource.java
 *
 * @see CreatePanelResource.java in backend
 */
export interface CreatePanelRequest {
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  communicationProtocol: string | null;
  panelType: string | null;
  location: string | null;
}

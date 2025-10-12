/**
 * Request DTO for creating a new cabinet
 * Corresponds to: CreateCabinetResource.java
 *
 * @see CreateCabinetResource.java in backend
 */
export interface CreateCabinetRequest {
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  communicationProtocol: string | null;
  cabinetType: string | null;
  location: string | null;
}

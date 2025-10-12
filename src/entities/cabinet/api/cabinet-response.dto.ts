/**
 * Response DTO for cabinet data from backend
 * Corresponds to: CabinetResponse.java
 *
 * @see CabinetResponse.java in backend
 */
export interface CabinetResponseDto {
  id: string | null;
  plantId: string | null;
  tag: string | null;
  areaId: string | null;
  communicationProtocol: string | null;
  cabinetType: string | null;
  location: string | null;
  status: string | null;
  createdAt: string | null; // ISO string from backend
  updatedAt: string | null; // ISO string from backend
  lastServiceAt: string | null; // ISO string from backend
}

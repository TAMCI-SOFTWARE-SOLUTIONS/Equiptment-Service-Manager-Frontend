/**
 * Request DTO for creating a new project
 * Corresponds to: CreateProjectResource.java
 *
 * @see CreateProjectResource.java in backend
 */
export interface CreateProjectRequest {
  name: string | null;
  code: string | null;
  description: string | null;
  clientId: string | null;
  bannerId: string | null;
  allowedEquipmentTypes: string[] | null;
}
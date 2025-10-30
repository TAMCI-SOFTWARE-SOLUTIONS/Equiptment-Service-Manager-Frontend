/**
 * Description domain entity for frontend
 * Based on: Description DDD Entity
 * 
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 * 
 * @see Description entity in backend
 */
export interface DescriptionEntity {
  id: string;
  name: string;
  modelId: string;
  brandId: string;
}
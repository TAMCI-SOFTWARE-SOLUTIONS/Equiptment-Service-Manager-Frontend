import {InspectableItemEntity} from '../../../../entities/inspectable-item';
import {ItemInspectionEntity} from '../../../../entities/item-inspection';

export interface InspectableItemWithDetails extends InspectableItemEntity {
  // Detalles adicionales
  brandName: string;
  modelName: string;

  // Inspección actual (si existe)
  inspection: ItemInspectionEntity | null;

  // Estado de guardado
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

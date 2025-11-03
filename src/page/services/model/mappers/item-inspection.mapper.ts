import {ItemInspectionEntity} from '../../../../entities/item-inspection';
import {InspectableItemEntity} from '../../../../entities/inspectable-item';
import {BrandEntity} from '../../../../entities/brand';
import {ModelEntity} from '../../../../entities/model';
import {DescriptionEntity} from '../../../../entities/description/model/entities/description.entity';
import {ItemInspectionWithComparison} from '../interfaces/item-inspection-with-comparison.interface';
import {calculateItemChangeType, hasItemChanged} from '../../utils/comparison.helpers';

export function mapToItemInspectionWithComparison(
  inspection: ItemInspectionEntity,
  item: InspectableItemEntity,
  brand: BrandEntity,
  model: ModelEntity,
  description: DescriptionEntity,
  previousBrand?: BrandEntity,
  previousModel?: ModelEntity,
  previousDescription?: DescriptionEntity
): ItemInspectionWithComparison {
  const mapped: ItemInspectionWithComparison = {
    // IDs
    id: inspection.id,
    itemId: inspection.itemId,

    // Datos actuales de inspección
    condition: inspection.condition,
    criticality: inspection.criticality,
    observation: inspection.observation,

    // Datos actuales del item
    tag: item.tag,
    type: item.type,
    brandId: item.brandId,
    modelId: item.modelId,
    descriptionId: item.descriptionId,
    brandName: brand.name,
    modelName: model.name,
    descriptionName: description.name,

    // Previous data (de inspection)
    previousTag: inspection.previousTag,
    previousBrandId: inspection.previousBrandId,
    previousModelId: inspection.previousModelId,
    previousDescriptionId: inspection.previousDescriptionId,
    previousCondition: inspection.previousCondition,
    previousCriticality: inspection.previousCriticality,
    previousObservation: inspection.previousObservation,

    // Previous names (lazy loaded)
    previousBrandName: previousBrand?.name,
    previousModelName: previousModel?.name,
    previousDescriptionName: previousDescription?.name,

    // Computed
    hasChanges: false, // Se calcula después
    changeType: 'none' // Se calcula después
  };

  // Calcular estado de cambios
  mapped.hasChanges = hasItemChanged(mapped);
  mapped.changeType = calculateItemChangeType(mapped);

  return mapped;
}

/**
 * Batch mapper para múltiples inspecciones
 */
export function mapMultipleToItemInspectionWithComparison(
  inspections: ItemInspectionEntity[],
  itemsMap: Map<string, InspectableItemEntity>,
  brandsMap: Map<string, BrandEntity>,
  modelsMap: Map<string, ModelEntity>,
  descriptionsMap: Map<string, DescriptionEntity>
): ItemInspectionWithComparison[] {
  return inspections.map(inspection => {
    const item = itemsMap.get(inspection.itemId);
    if (!item) {
      console.warn(`⚠️ Item ${inspection.itemId} not found for inspection ${inspection.id}`);
      return null;
    }

    const brand = brandsMap.get(item.brandId);
    const model = modelsMap.get(item.modelId);
    const description = descriptionsMap.get(item.descriptionId);

    if (!brand || !model || !description) {
      console.warn(`⚠️ Missing related data for item ${item.id}`);
      return null;
    }

    // Buscar previous data si existe
    const previousBrand = inspection.previousBrandId
      ? brandsMap.get(inspection.previousBrandId)
      : undefined;
    const previousModel = inspection.previousModelId
      ? modelsMap.get(inspection.previousModelId)
      : undefined;
    const previousDescription = inspection.previousDescriptionId
      ? descriptionsMap.get(inspection.previousDescriptionId)
      : undefined;

    return mapToItemInspectionWithComparison(
      inspection,
      item,
      brand,
      model,
      description,
      previousBrand,
      previousModel,
      previousDescription
    );
  }).filter(Boolean) as ItemInspectionWithComparison[];
}

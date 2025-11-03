import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, forkJoin } from 'rxjs';
import { EquipmentServiceEntity, EquipmentServiceService } from '../../../../entities/equipment-service';
import { CabinetEntity } from '../../../../entities/cabinet/model';
import { PanelEntity } from '../../../../entities/panel/model';
import { SupervisorEntity, SupervisorService } from '../../../../entities/supervisor';
import { ProfileEntity, ProfileService } from '../../../../entities/profile';
import { BrandService } from '../../../../entities/brand';
import { ModelService } from '../../../../entities/model';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { CabinetService } from '../../../../entities/cabinet/api';
import { PanelService } from '../../../../entities/panel/api';
import { ItemInspectionWithComparison } from '../interfaces/item-inspection-with-comparison.interface';
import { InspectableItemTypeEnum } from '../../../../shared/model/enums';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {FileEntity} from '../../../../entities/file/model/file.entity';
import {DescriptionService} from '../../../../entities/description/api/services/description.service';
import {FileService} from '../../../../entities/file/api/file.service';
import {
  EquipmentPowerDistributionAssignmentService
} from '../../../../entities/equipment-power-distribution-assignment/api';
import {PowerDistributionPanelService} from '../../../../entities/power-distribution-panel/api';
import {mapMultipleToItemInspectionWithComparison} from '../mappers/item-inspection.mapper';

export interface ServiceDetailsState {
  // Service data
  service: EquipmentServiceEntity | null;
  equipment: CabinetEntity | PanelEntity | null;
  supervisor: SupervisorEntity | null;
  operator: ProfileEntity | null;

  // Inspections with comparison
  itemInspections: ItemInspectionWithComparison[];

  // Power distribution
  powerDistributions: EquipmentPowerDistributionAssignmentEntity[];
  powerPanels: Map<string, PowerDistributionPanelEntity>;

  // Evidence files
  evidenceFiles: {
    videoStart: FileEntity | null;
    videoEnd: FileEntity | null;
    startPhotos: FileEntity[];
    midPhotos: FileEntity[];
    endPhotos: FileEntity[];
    report: FileEntity | null;
  };

  // UI state
  selectedFilter: 'all' | 'changes-only';
  selectedCategory: InspectableItemTypeEnum | null;
  openCategories: Set<InspectableItemTypeEnum>;

  // Loading states
  isLoadingService: boolean;
  isLoadingInspections: boolean;
  isLoadingEvidence: boolean;
  isUploadingReport: boolean;

  // Error
  error: string | null;
}

const initialState: ServiceDetailsState = {
  service: null,
  equipment: null,
  supervisor: null,
  operator: null,
  itemInspections: [],
  powerDistributions: [],
  powerPanels: new Map(),
  evidenceFiles: {
    videoStart: null,
    videoEnd: null,
    startPhotos: [],
    midPhotos: [],
    endPhotos: [],
    report: null
  },
  selectedFilter: 'all',
  selectedCategory: null,
  openCategories: new Set(),
  isLoadingService: false,
  isLoadingInspections: false,
  isLoadingEvidence: false,
  isUploadingReport: false,
  error: null
};

export const ServiceDetailsStore = signalStore(
  withState<ServiceDetailsState>(initialState),

  withComputed((state) => ({
    // Operator full name
    operatorFullName: computed(() => {
      const operator = state.operator();
      if (!operator) return '';
      return [operator.names, operator.firstSurname, operator.secondSurname]
        .filter(Boolean)
        .join(' ');
    }),

    // Filtered items by filter and category
    filteredItems: computed(() => {
      let items = state.itemInspections();

      // Filter by changes
      if (state.selectedFilter() === 'changes-only') {
        items = items.filter(item => item.hasChanges);
      }

      // Filter by category
      if (state.selectedCategory()) {
        items = items.filter(item => item.type === state.selectedCategory());
      }

      return items;
    }),

    // Stats
    totalItems: computed(() => state.itemInspections().length),
    totalChanges: computed(() => state.itemInspections().filter(i => i.hasChanges).length),
    totalImproved: computed(() => state.itemInspections().filter(i => i.changeType === 'improved').length),
    totalDegraded: computed(() => state.itemInspections().filter(i => i.changeType === 'degraded').length),

    // Total circuits
    totalCircuits: computed(() => {
      return state.powerDistributions().reduce(
        (sum, dist) => sum + dist.circuitAssignments.length,
        0
      );
    }),

    // Loading state
    isLoading: computed(() => {
      return state.isLoadingService() ||
        state.isLoadingInspections() ||
        state.isLoadingEvidence() ||
        state.isUploadingReport();
    })
  })),

  withComputed((state) => ({
    // Group items by category
    itemsByCategory: computed(() => {
      const items = state.filteredItems();
      const grouped = new Map<InspectableItemTypeEnum, ItemInspectionWithComparison[]>();

      items.forEach(item => {
        if (!grouped.has(item.type)) {
          grouped.set(item.type, []);
        }
        grouped.get(item.type)!.push(item);
      });

      return grouped;
    }),
  })),

  withMethods((store) => {
    const serviceService = inject(EquipmentServiceService);
    //const itemInspectionService = inject(ItemInspectionService);
    //const inspectableItemService = inject(InspectableItemService);
    const supervisorService = inject(SupervisorService);
    const profileService = inject(ProfileService);
    const brandService = inject(BrandService);
    const modelService = inject(ModelService);
    const descriptionService = inject(DescriptionService);
    const fileService = inject(FileService);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const powerDistAssignService = inject(EquipmentPowerDistributionAssignmentService);
    const powerPanelService = inject(PowerDistributionPanelService);

    return {
      /**
       * Cargar servicio completo
       */
      async loadService(serviceId: string): Promise<void> {
        patchState(store, { isLoadingService: true, error: null });

        try {
          // 1. Cargar servicio
          const service = await firstValueFrom(serviceService.getById(serviceId));
          patchState(store, { service });

          // 2. Cargar datos relacionados en paralelo
          const [equipment, supervisor, operator, powerDistributions] = await firstValueFrom(
            forkJoin([
              service.equipmentType === EquipmentTypeEnum.CABINET
                ? cabinetService.getById(service.equipmentId)
                : panelService.getById(service.equipmentId),
              supervisorService.getById(service.supervisorId),
              profileService.getByUserId(service.operatorId),
              powerDistAssignService.getAllByEquipmentId(service.equipmentId)
            ])
          );

          // 3. Cargar power panels
          const panelIds = powerDistributions.map(pd => pd.powerDistributionPanelId);
          const panels = panelIds.length > 0
            ? await firstValueFrom(powerPanelService.batchGetByIds(panelIds))
            : [];
          const powerPanelsMap = new Map(panels.map(p => [p.id, p]));

          patchState(store, {
            equipment,
            supervisor,
            operator,
            powerDistributions,
            powerPanels: powerPanelsMap,
            isLoadingService: false
          });

          // 4. Cargar inspecciones y evidencias
          await Promise.all([
            this.loadItemInspections(),
            this.loadEvidenceFiles()
          ]);

        } catch (error: any) {
          console.error('❌ Error loading service:', error);
          patchState(store, {
            isLoadingService: false,
            error: error.message || 'Error al cargar el servicio'
          });
        }
      },

      /**
       * Cargar inspecciones con comparación
       */
      async loadItemInspections(): Promise<void> {
        const service = store.service();
        const equipment = store.equipment();
        if (!service || !equipment) return;

        patchState(store, { isLoadingInspections: true });

        try {
          // 1. Cargar inspecciones del servicio
          const inspections = await firstValueFrom(
            serviceService.getAllItemInspections(service.id)
          );

          if (inspections.length === 0) {
            patchState(store, { itemInspections: [], isLoadingInspections: false });
            return;
          }

          // 2. Cargar items actuales del equipment
          const currentItems = await firstValueFrom(
            service.equipmentType === EquipmentTypeEnum.CABINET
              ? cabinetService.getAllInspectableItems(service.equipmentId)
              : panelService.getAllInspectableItems(service.equipmentId)
          );

          const itemsMap = new Map(currentItems.map(i => [i.id, i]));

          // 3. Recolectar IDs para batch fetch
          const currentBrandIds = [...new Set(currentItems.map(i => i.brandId))];
          const currentModelIds = [...new Set(currentItems.map(i => i.modelId))];
          const currentDescriptionIds = [...new Set(currentItems.map(i => i.descriptionId))];

          const previousBrandIds = [...new Set(
            inspections
              .filter(i => i.previousBrandId)
              .map(i => i.previousBrandId!)
          )];
          const previousModelIds = [...new Set(
            inspections
              .filter(i => i.previousModelId)
              .map(i => i.previousModelId!)
          )];
          const previousDescriptionIds = [...new Set(
            inspections
              .filter(i => i.previousDescriptionId)
              .map(i => i.previousDescriptionId!)
          )];

          // Combinar current + previous IDs
          const allBrandIds = [...new Set([...currentBrandIds, ...previousBrandIds])];
          const allModelIds = [...new Set([...currentModelIds, ...previousModelIds])];
          const allDescriptionIds = [...new Set([...currentDescriptionIds, ...previousDescriptionIds])];

          // 4. Fetch all related entities
          const [brands, models, descriptions] = await firstValueFrom(
            forkJoin([
              brandService.batchGetByIds(allBrandIds),
              modelService.batchGetByIds(allModelIds),
              descriptionService.batchGetByIds(allDescriptionIds)
            ])
          );

          const brandsMap = new Map(brands.map(b => [b.id, b]));
          const modelsMap = new Map(models.map(m => [m.id, m]));
          const descriptionsMap = new Map(descriptions.map(d => [d.id, d]));

          // 5. Mapear a ItemInspectionWithComparison
          const enrichedInspections = mapMultipleToItemInspectionWithComparison(
            inspections,
            itemsMap,
            brandsMap,
            modelsMap,
            descriptionsMap
          );

          patchState(store, {
            itemInspections: enrichedInspections,
            isLoadingInspections: false
          });

        } catch (error: any) {
          console.error('❌ Error loading inspections:', error);
          patchState(store, {
            isLoadingInspections: false,
            error: error.message || 'Error al cargar las inspecciones'
          });
        }
      },

      /**
       * Cargar archivos de evidencia
       */
      async loadEvidenceFiles(): Promise<void> {
        const service = store.service();
        if (!service) return;

        patchState(store, { isLoadingEvidence: true });

        try {
          const fileIds: string[] = [
            service.videoStartFileId,
            service.videoEndFileId,
            ...service.startPhotos,
            ...service.midPhotos,
            ...service.endPhotos,
            service.reportDocumentFileId
          ].filter(id => id && id.trim() !== '') as string[];

          if (fileIds.length === 0) {
            patchState(store, {
              evidenceFiles: initialState.evidenceFiles,
              isLoadingEvidence: false
            });
            return;
          }

          const fileEntities = await Promise.all(
            fileIds.map(id => firstValueFrom(fileService.getById(id)))
          );

          const filesMap = new Map(fileEntities.map(f => [f.id, f]));

          const evidenceFiles = {
            videoStart: service.videoStartFileId
              ? filesMap.get(service.videoStartFileId) || null
              : null,
            videoEnd: service.videoEndFileId
              ? filesMap.get(service.videoEndFileId) || null
              : null,
            startPhotos: service.startPhotos
              .map(id => filesMap.get(id)!)
              .filter(Boolean),
            midPhotos: service.midPhotos
              .map(id => filesMap.get(id)!)
              .filter(Boolean),
            endPhotos: service.endPhotos
              .map(id => filesMap.get(id)!)
              .filter(Boolean),
            report: service.reportDocumentFileId
              ? filesMap.get(service.reportDocumentFileId) || null
              : null
          };

          patchState(store, {
            evidenceFiles,
            isLoadingEvidence: false
          });

        } catch (error: any) {
          console.error('❌ Error loading evidence files:', error);
          patchState(store, {
            isLoadingEvidence: false,
            error: error.message || 'Error al cargar las evidencias'
          });
        }
      },

      /**
       * Upload report PDF
       */
      async uploadReport(file: File): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        patchState(store, { isUploadingReport: true, error: null });

        try {
          const uploadedFile = await firstValueFrom(fileService.upload(file));

          const updatedService = await firstValueFrom(
            serviceService.update(service.id, {
              ...service,
              reportDocumentFileId: uploadedFile.id
            })
          );

          patchState(store, {
            service: updatedService,
            isUploadingReport: false
          });

          await this.loadEvidenceFiles();

          return true;

        } catch (error: any) {
          console.error('❌ Error uploading report:', error);
          patchState(store, {
            isUploadingReport: false,
            error: error.message || 'Error al subir el reporte'
          });
          return false;
        }
      },

      /**
       * Remove report PDF
       */
      async removeReport(): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        patchState(store, { isUploadingReport: true, error: null });

        try {
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, {
              ...service,
              reportDocumentFileId: null
            })
          );

          patchState(store, {
            service: updatedService,
            isUploadingReport: false
          });

          await this.loadEvidenceFiles();

          return true;

        } catch (error: any) {
          console.error('❌ Error removing report:', error);
          patchState(store, {
            isUploadingReport: false,
            error: error.message || 'Error al eliminar el reporte'
          });
          return false;
        }
      },

      /**
       * UI: Set filter
       */
      setFilter(filter: 'all' | 'changes-only'): void {
        patchState(store, { selectedFilter: filter });
      },

      /**
       * UI: Set category
       */
      setCategory(category: InspectableItemTypeEnum | null): void {
        patchState(store, { selectedCategory: category });
      },

      /**
       * UI: Toggle category accordion
       */
      toggleCategory(category: InspectableItemTypeEnum): void {
        const openCategories = new Set(store.openCategories());
        if (openCategories.has(category)) {
          openCategories.delete(category);
        } else {
          openCategories.add(category);
        }
        patchState(store, { openCategories });
      },

      /**
       * UI: Check if category is open
       */
      isCategoryOpen(category: InspectableItemTypeEnum): boolean {
        return store.openCategories().has(category);
      },

      /**
       * Reset store
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);

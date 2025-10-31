import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../entities/power-distribution-panel/model';
import {
  EquipmentPowerDistributionAssignmentService
} from '../../../entities/equipment-power-distribution-assignment/api';
import {PowerDistributionPanelService} from '../../../entities/power-distribution-panel/api';

export interface PowerAssignmentWithPanel {
  assignment: EquipmentPowerDistributionAssignmentEntity;
  panel: PowerDistributionPanelEntity | null;
  isLoadingPanel: boolean;
}

export interface EquipmentPowerAssignmentsState {
  equipmentId: string | null;
  assignments: PowerAssignmentWithPanel[];
  isLoading: boolean;
  error: string | null;

  // Form state para drawer
  isDrawerOpen: boolean;
  isSubmitting: boolean;
  formData: {
    powerDistributionPanelId: string | null;
    selectedCircuits: Set<number>;
  };
  formError: string | null;

  // Available panels para dropdown
  availablePanels: PowerDistributionPanelEntity[];
  isLoadingPanels: boolean;

  // Edit mode
  editingAssignmentId: string | null;
}

const initialState: EquipmentPowerAssignmentsState = {
  equipmentId: null,
  assignments: [],
  isLoading: false,
  error: null,
  isDrawerOpen: false,
  isSubmitting: false,
  formData: {
    powerDistributionPanelId: null,
    selectedCircuits: new Set<number>()
  },
  formError: null,
  availablePanels: [],
  isLoadingPanels: false,
  editingAssignmentId: null
};

export const EquipmentPowerAssignmentsStore = signalStore(
  withState<EquipmentPowerAssignmentsState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay asignaciones
     */
    hasAssignments: computed(() => state.assignments().length > 0),

    /**
     * Cantidad de circuitos seleccionados
     */
    selectedCircuitsCount: computed(() => state.formData().selectedCircuits.size),

    /**
     * Array de circuitos seleccionados (para mostrar)
     */
    selectedCircuitsArray: computed(() =>
      Array.from(state.formData().selectedCircuits).sort((a, b) => a - b)
    ),

    /**
     * Indica si el formulario es válido
     */
    isFormValid: computed(() => {
      const data = state.formData();
      return data.powerDistributionPanelId !== null &&
        data.selectedCircuits.size > 0;
    }),

    /**
     * Indica si se puede enviar
     */
    canSubmit: computed(() => {
      const data = state.formData();
      return data.powerDistributionPanelId !== null &&
        data.selectedCircuits.size > 0 &&
        !state.isSubmitting();
    }),

    /**
     * Modo edición o creación
     */
    isEditMode: computed(() => state.editingAssignmentId() !== null),

    /**
     * Título del drawer
     */
    drawerTitle: computed(() =>
      state.editingAssignmentId()
        ? 'Editar Punto de bloqueo'
        : 'Asignar Punto de bloqueo'
    )
  })),

  withMethods((store) => {
    const assignmentService = inject(EquipmentPowerDistributionAssignmentService);
    const panelService = inject(PowerDistributionPanelService);

    return {
      /**
       * Cargar asignaciones de un equipo
       */
      async loadAssignments(equipmentId: string): Promise<void> {
        patchState(store, {
          equipmentId,
          isLoading: true,
          error: null
        });

        try {
          const assignments = await firstValueFrom(
            assignmentService.getAllByEquipmentId(equipmentId)
          );

          // Crear estructura con placeholders para panels
          const assignmentsWithPanels: PowerAssignmentWithPanel[] = assignments.map(a => ({
            assignment: a,
            panel: null,
            isLoadingPanel: true
          }));

          patchState(store, {
            assignments: assignmentsWithPanels,
            isLoading: false,
            error: null
          });

          // Cargar info de cada panel en paralelo
          await Promise.all(
            assignments.map((assignment, index) =>
              this.loadPanelInfo(assignment.powerDistributionPanelId, index)
            )
          );

        } catch (error: any) {
          console.error('❌ Error loading power assignments:', error);
          patchState(store, {
            assignments: [],
            isLoading: false,
            error: error.message || 'Error al cargar los tableros de alimentación eléctrica'
          });
        }
      },

      /**
       * Cargar info de un panel específico
       */
      async loadPanelInfo(panelId: string, assignmentIndex: number): Promise<void> {
        try {
          const panel = await firstValueFrom(panelService.getById(panelId));

          patchState(store, (state) => {
            const updatedAssignments = [...state.assignments];
            updatedAssignments[assignmentIndex] = {
              ...updatedAssignments[assignmentIndex],
              panel,
              isLoadingPanel: false
            };
            return { assignments: updatedAssignments };
          });

        } catch (error: any) {
          console.error('❌ Error loading panel info:', error);

          patchState(store, (state) => {
            const updatedAssignments = [...state.assignments];
            updatedAssignments[assignmentIndex] = {
              ...updatedAssignments[assignmentIndex],
              panel: null,
              isLoadingPanel: false
            };
            return { assignments: updatedAssignments };
          });
        }
      },

      /**
       * Cargar paneles disponibles para el dropdown
       */
      async loadAvailablePanels(): Promise<void> {
        patchState(store, { isLoadingPanels: true });

        try {
          const panels = await firstValueFrom(panelService.getAll());

          patchState(store, {
            availablePanels: panels.sort((a, b) => a.code.localeCompare(b.code)),
            isLoadingPanels: false
          });

        } catch (error: any) {
          console.error('❌ Error loading available panels:', error);
          patchState(store, {
            availablePanels: [],
            isLoadingPanels: false
          });
        }
      },

      /**
       * Abrir drawer para crear
       */
      async openDrawerForCreate(): Promise<void> {
        await this.loadAvailablePanels();

        patchState(store, {
          isDrawerOpen: true,
          editingAssignmentId: null,
          formData: {
            powerDistributionPanelId: null,
            selectedCircuits: new Set<number>()
          },
          formError: null
        });
      },

      /**
       * Abrir drawer para editar
       */
      async openDrawerForEdit(assignmentId: string): Promise<void> {
        const assignmentWithPanel = store.assignments().find(a => a.assignment.id === assignmentId);
        if (!assignmentWithPanel) return;

        await this.loadAvailablePanels();

        patchState(store, {
          isDrawerOpen: true,
          editingAssignmentId: assignmentId,
          formData: {
            powerDistributionPanelId: assignmentWithPanel.assignment.powerDistributionPanelId,
            selectedCircuits: new Set(assignmentWithPanel.assignment.circuitAssignments)
          },
          formError: null
        });
      },

      /**
       * Cerrar drawer
       */
      closeDrawer(): void {
        patchState(store, {
          isDrawerOpen: false,
          editingAssignmentId: null,
          formData: {
            powerDistributionPanelId: null,
            selectedCircuits: new Set<number>()
          },
          formError: null
        });
      },

      /**
       * Seleccionar panel
       */
      selectPanel(panelId: string | null): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            powerDistributionPanelId: panelId
          }
        }));
      },

      /**
       * Toggle circuito
       */
      toggleCircuit(circuitNumber: number): void {
        patchState(store, (state) => {
          const circuits = new Set(state.formData.selectedCircuits);
          if (circuits.has(circuitNumber)) {
            circuits.delete(circuitNumber);
          } else {
            circuits.add(circuitNumber);
          }
          return {
            formData: {
              ...state.formData,
              selectedCircuits: circuits
            }
          };
        });
      },

      /**
       * Seleccionar todos los circuitos
       */
      selectAllCircuits(): void {
        const allCircuits = new Set(Array.from({ length: 30 }, (_, i) => i + 1));
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            selectedCircuits: allCircuits
          }
        }));
      },

      /**
       * Limpiar selección de circuitos
       */
      clearCircuits(): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            selectedCircuits: new Set<number>()
          }
        }));
      },

      /**
       * Crear asignación
       */
      async createAssignment(): Promise<boolean> {
        if (!store.canSubmit()) return false;

        const equipmentId = store.equipmentId();
        if (!equipmentId) return false;

        patchState(store, {
          isSubmitting: true,
          formError: null
        });

        try {
          const assignmentData: EquipmentPowerDistributionAssignmentEntity = {
            id: store.editingAssignmentId() || '',
            equipmentId,
            powerDistributionPanelId: store.formData().powerDistributionPanelId!,
            circuitAssignments: Array.from(store.formData().selectedCircuits)
          };

          let result: EquipmentPowerDistributionAssignmentEntity;

          if (store.editingAssignmentId()) {
            console.log('⚠️ Actualizando assignment:', store.editingAssignmentId());

            await firstValueFrom(assignmentService.delete(store.editingAssignmentId()!));

            result = await firstValueFrom(assignmentService.create(assignmentData));
          } else {
            result = await firstValueFrom(assignmentService.create(assignmentData));
            console.log('✅ Power assignment created:', result);
          }

          await this.loadAssignments(equipmentId);

          patchState(store, {
            isSubmitting: false,
            formError: null
          });

          this.closeDrawer();
          return true;

        } catch (error: any) {
          console.error('❌ Error saving power assignment:', error);

          patchState(store, {
            isSubmitting: false,
            formError: error.message || 'Error al guardar el punto de bloqueo'
          });

          return false;
        }
      },

      /**
       * Eliminar asignación
       */
      async deleteAssignment(assignmentId: string): Promise<boolean> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          await firstValueFrom(assignmentService.delete(assignmentId));

          console.log('✅ Power assignment deleted');

          // Recargar asignaciones
          const equipmentId = store.equipmentId();
          if (equipmentId) {
            await this.loadAssignments(equipmentId);
          }

          return true;

        } catch (error: any) {
          console.error('❌ Error deleting power assignment:', error);

          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al eliminar el punto de bloqueo'
          });

          return false;
        }
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null, formError: null });
      },

      /**
       * Reset del store
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);

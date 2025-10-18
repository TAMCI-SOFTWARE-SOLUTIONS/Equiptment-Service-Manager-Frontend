export interface CreateEquipmentPowerDistributionAssignmentRequest {
  equipmentId: string | null;
  powerDistributionPanelId: string | null;
  circuitAssignments: number[] | null;
}

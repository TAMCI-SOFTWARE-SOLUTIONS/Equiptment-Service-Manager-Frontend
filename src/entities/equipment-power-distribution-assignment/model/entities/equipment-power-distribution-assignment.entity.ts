export interface EquipmentPowerDistributionAssignmentEntity {
  id: string;
  equipmentId: string;
  powerDistributionPanelId: string;
  circuitAssignments: number[];
}

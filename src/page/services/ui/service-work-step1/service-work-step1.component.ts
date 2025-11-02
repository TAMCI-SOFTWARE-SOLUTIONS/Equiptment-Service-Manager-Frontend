import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentServiceEntity } from '../../../../entities/equipment-service';
import { SupervisorEntity } from '../../../../entities/supervisor';
import { CabinetEntity } from '../../../../entities/cabinet/model';
import { PanelEntity } from '../../../../entities/panel/model';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { EquipmentPowerDistributionAssignmentEntity } from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import { PowerDistributionPanelEntity } from '../../../../entities/power-distribution-panel/model';
import {Step1HeroCardComponent} from '../step1-hero-card/step1-hero-card.component';
import {Step1StatsPanelComponent} from '../step1-stats-panel/step1-stats-panel.component';
import {Step1EquipmentDetailsComponent} from '../step1-equipment-details/step1-equipment-details.component';

@Component({
  selector: 'app-service-work-step1',
  standalone: true,
  imports: [
    CommonModule,
    Step1HeroCardComponent,
    Step1StatsPanelComponent,
    Step1EquipmentDetailsComponent
  ],
  template: `
    <div class="space-y-6">

      <!-- Hero Card (Full Width) -->
      <app-step1-hero-card
        [service]="service()"
        [supervisor]="supervisor()"
        [equipment]="equipment()"
        [totalItems]="totalItems()"
        [totalCircuits]="totalCircuits()">
      </app-step1-hero-card>

      <!-- Two Columns Layout (Desktop) / Stack (Mobile) -->
      <div class="grid gap-6 lg:grid-cols-12">

        <!-- Left: Stats Panel (4 columns on desktop) -->
        <div class="lg:col-span-4">
          <app-step1-stats-panel
            [service]="service()"
            [supervisor]="supervisor()"
            [equipment]="equipment()"
            [operatorFullName]="operatorFullName()">
          </app-step1-stats-panel>
        </div>

        <!-- Right: Equipment Details (8 columns on desktop) -->
        <div class="lg:col-span-8">
          <app-step1-equipment-details
            [equipment]="equipment()"
            [equipmentType]="equipmentType()"
            [powerDistributions]="powerDistributions()"
            [powerPanels]="powerPanels()">
          </app-step1-equipment-details>
        </div>

      </div>

    </div>
  `
})
export class ServiceWorkStep1Component {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly supervisor = input.required<SupervisorEntity>();
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly equipmentType = input.required<EquipmentTypeEnum>();
  readonly operatorFullName = input.required<string>();
  readonly totalItems = input.required<number>();
  readonly totalCircuits = input.required<number>();
  readonly powerDistributions = input.required<EquipmentPowerDistributionAssignmentEntity[]>();
  readonly powerPanels = input.required<Map<string, PowerDistributionPanelEntity>>();
}

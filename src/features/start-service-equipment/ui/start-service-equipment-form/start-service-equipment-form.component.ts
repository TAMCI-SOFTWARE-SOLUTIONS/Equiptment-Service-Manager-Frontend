import {Component, inject, OnInit} from '@angular/core';
import {CabinetService} from '../../../../entities/cabinet/api';
import {ActivatedRoute, Router} from '@angular/router';
import {PanelService} from '../../../../entities/panel/api/panel.service';
import {StartServiceEquipmentStore} from '../../model/start-service-equipment.store';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-start-service-equipment-form',
  imports: [
    JsonPipe
  ],
  providers: [StartServiceEquipmentStore],
  templateUrl: './start-service-equipment-form.component.html',
  standalone: true,
  styleUrl: './start-service-equipment-form.component.css'
})
export class StartServiceEquipmentFormComponent implements OnInit {
  readonly startServiceEquipmentStore = inject(StartServiceEquipmentStore);
  readonly cabinetService = inject(CabinetService);
  readonly panelService = inject(PanelService);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  projectId: string | null = null;
  equipmentId: string | null = null;
  equipmentType: string | null = null;
  serviceType: string | null = null;

  ngOnInit(): void {
    this.subscribeToRouteParams();
  }

  private subscribeToRouteParams() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId');
      console.log('SearchContainerComponent: extracted projectId from route', this.projectId);
      this.equipmentId = params.get('equipmentId');
      console.log('SearchContainerComponent: extracted equipmentId from route', this.equipmentId);
      this.equipmentType = this.route.snapshot.queryParamMap.get('equipment-type');
      console.log('SearchContainerComponent: extracted equipmentType from route', this.equipmentType);
      this.serviceType = this.route.snapshot.queryParamMap.get('service');
      console.log('SearchContainerComponent: extracted serviceType from route', this.serviceType);
      this.checkEquipmentType();
    });
  }

  private checkEquipmentType() {
    if (this.equipmentType) {
      switch (this.equipmentType.toUpperCase()) {
        case 'CABINET':
          this.getCabinetById();
          break;
        case 'PANEL':
          this.getPanelById();
          break;
        default:
          console.warn('Unknown equipment type:', this.equipmentType);
      }
    } else {
      console.warn('Equipment type is not specified.');
    }
  }

  private getCabinetById() {
    if (this.equipmentId) {
      this.cabinetService.getById(this.equipmentId).subscribe({
        next: (cabinet) => {
          this.startServiceEquipmentStore.setCabinet(cabinet);
          console.log('Fetched cabinet:', cabinet);
        },
        error: (error) => {
          console.error('Error fetching cabinet:', error);
        }
      });
    } else {
      console.warn('Equipment ID is not specified.');
    }
  }

  private getPanelById() {
    if (this.equipmentId) {
      this.panelService.getById(this.equipmentId).subscribe({
        next: (panel) => {
          this.startServiceEquipmentStore.setPanel(panel);
          console.log('Fetched panel:', panel);
        },
        error: (error) => {
          console.error('Error fetching panel:', error);
        }
      });
    } else {
      console.warn('Equipment ID is not specified.');
    }
  }
}

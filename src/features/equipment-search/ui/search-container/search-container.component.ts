import {Component, inject, OnInit} from '@angular/core';
import {SearchInputComponent} from '../search-input/search-input.component';
import {FiltersSidebarComponent} from '../filters-sidebar/filters-sidebar.component';
import {SearchResultsComponent} from '../search-results/search-results.component';
import {EquipmentSearchStore} from '../../model';
import {ProjectService} from '../../../../entities/project/api/project.service';
import {CabinetService} from '../../../../entities/cabinet/api';
import {ActivatedRoute} from '@angular/router';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {FlowButtonsComponent} from '../flow-buttons/flow-buttons.component';
import {CabinetTypeService} from '../../../../entities/cabinet-type/api';
import {AreaService} from '../../../../entities/area/api';
import {PanelService} from '../../../../entities/panel/api/panel.service';
import {PanelTypeService} from '../../../../entities/panel-type/api';

@Component({
  selector: 'app-search-container',
  imports: [
    SearchInputComponent,
    FiltersSidebarComponent,
    SearchResultsComponent,
    FlowButtonsComponent
  ],
  providers: [EquipmentSearchStore],
  templateUrl: './search-container.component.html',
  standalone: true,
  styleUrl: './search-container.component.css'
})
export class SearchContainerComponent  implements OnInit {
  readonly equipmentSearchStore = inject(EquipmentSearchStore);
  readonly projectService = inject(ProjectService);
  readonly cabinetService = inject(CabinetService);
  readonly cabinetTypesService = inject(CabinetTypeService);
  readonly panelService = inject(PanelService);
  readonly panelTypesService = inject(PanelTypeService);
  readonly areasService = inject(AreaService);
  readonly route = inject(ActivatedRoute);

  projectId: string | null = null;

  ngOnInit(): void {
    this.subscribeToRouteParams();
  }

  private subscribeToRouteParams() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId');
      console.log('SearchContainerComponent: extracted projectId from route', this.projectId);
      if (this.projectId) {
        this.getProjectById();
      }
    });
  }

  private getProjectById() {
    if (!this.projectId) {
      this.equipmentSearchStore.setError('Project ID is missing');
      return;
    }

    this.projectService.getById(this.projectId).subscribe({
      next: (project) => {
        console.log('SearchContainerComponent: fetched project', project);
        this.equipmentSearchStore.setProject(project);
        this.getAllAreasByClientId();
        this.checkEquipmentType();
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading project');
        console.error('SearchContainerComponent: error fetching project', error);
      }
    });
  }

  private getAllAreasByClientId() {
    const clientId = this.equipmentSearchStore.project()?.clientId;
    if (!clientId) {
      this.equipmentSearchStore.setError('Client ID is missing');
      return;
    }

    this.areasService.getAllByClientId(clientId).subscribe({
      next: (areas) => {
        console.log('SearchContainerComponent: fetched areas', areas);
        this.equipmentSearchStore.setAreas(areas);
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading areas');
        console.error('SearchContainerComponent: error fetching areas', error);
      }
    });
  }

  private checkEquipmentType(){
    if (this.equipmentSearchStore.project()?.allowedEquipmentTypes?.includes(EquipmentTypeEnum.CABINET)) {
      this.getCabinetTypes();
      this.getCabinets();
    }

    if (this.equipmentSearchStore.project()?.allowedEquipmentTypes?.includes(EquipmentTypeEnum.PANEL)) {
      this.getPanelTypes();
      this.getPanels();
    }
  }

  private getCabinets() {
    this.cabinetService.getAll().subscribe({
      next: (cabinets) => {
        console.log('SearchContainerComponent: fetched cabinets', cabinets);
        this.equipmentSearchStore.setCabinets(cabinets);
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading cabinets');
        console.error('SearchContainerComponent: error fetching cabinets', error);
      }
    });
  }

  private getCabinetTypes() {
    this.cabinetTypesService.getAll().subscribe({
      next: (types) => {
        console.log('SearchContainerComponent: fetched cabinet types', types);
        this.equipmentSearchStore.setCabinetsTypes(types);
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading cabinet types');
        console.error('SearchContainerComponent: error fetching cabinet types', error);
      }
    });
  }

  private getPanels() {
    this.panelService.getAll().subscribe({
      next: (panels) => {
        console.log('SearchContainerComponent: fetched panels', panels);
        this.equipmentSearchStore.setPanels(panels);
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading panels');
        console.error('SearchContainerComponent: error fetching panels', error);
      }
    });
  }

  private getPanelTypes() {
    this.panelTypesService.getAll().subscribe({
      next: (types) => {
        console.log('SearchContainerComponent: fetched panel types', types);
        this.equipmentSearchStore.setPanelsTypes(types);
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading panel types');
        console.error('SearchContainerComponent: error fetching panel types', error);
      }
    });
  }

  onBack() {
    window.history.back();
  }

  onNext() {
    // TODO: Implement navigation to the next step
  }
}

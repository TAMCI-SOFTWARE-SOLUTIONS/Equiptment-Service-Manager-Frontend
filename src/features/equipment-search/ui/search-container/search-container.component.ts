import {Component, inject, OnInit} from '@angular/core';
import {SearchInputComponent} from '../search-input/search-input.component';
import {FiltersSidebarComponent} from '../filters-sidebar/filters-sidebar.component';
import {SearchResultsComponent} from '../search-results/search-results.component';
import {EquipmentSearchStore} from '../../model/equipment-search.store';
import {ProjectService} from '../../../../entities/project/api/project.service';
import {CabinetService} from '../../../../entities/cabinet/api';
import {ActivatedRoute} from '@angular/router';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {FlowButtonsComponent} from '../flow-buttons/flow-buttons.component';
import {CabinetTypeService} from '../../../../entities/cabinet-type/api';

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
        this.checkEquipmentType();
      },
      error: (error) => {
        this.equipmentSearchStore.setError('Error loading project');
        console.error('SearchContainerComponent: error fetching project', error);
      }
    });
  }

  private checkEquipmentType(){
    if (this.equipmentSearchStore.project()?.allowedEquipmentTypes?.includes(EquipmentTypeEnum.CABINET)) {
      this.getCabinetTypes();
      this.getCabinets();
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
}

import {Component, inject, OnInit} from '@angular/core';
import {SelectListProjectStore} from '../../model';
import {ProjectService} from '../../../../entities/project/api/project.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectWithBannerItemComponent} from '../project-with-banner-item/project-with-banner-item.component';
import {Button} from 'primeng/button';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';
import {Location, NgClass} from '@angular/common';
import {ContextStore} from '../../../../shared/model/context.store';

@Component({
  selector: 'app-select-list-project',
  imports: [
    ProjectWithBannerItemComponent,
    Button,
    NgClass
  ],
  providers: [SelectListProjectStore],
  templateUrl: './select-list-project.component.html',
  standalone: true,
  styleUrl: './select-list-project.component.css'
})
export class SelectListProjectComponent implements OnInit{
  readonly selectListProjectStore = inject(SelectListProjectStore);
  readonly contextStore = inject(ContextStore);
  readonly projectService = inject(ProjectService);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private location = inject(Location);

  clientId: string | null = null;

  ngOnInit(): void {
    this.subscribeToRouteParams();
  }

  private subscribeToRouteParams() {
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('clientId');
      console.log('SelectListProjectComponent: extracted clientId from route', this.clientId);
      if (this.clientId) {
        this.getAllProjectsByClientId();
      }
    });
  }

  private getAllProjectsByClientId() {
    this.selectListProjectStore.activateLoading();
    this.selectListProjectStore.setError(null);

    if (!this.clientId) {
      this.selectListProjectStore.setError('Client ID is missing');
      return;
    }

    this.projectService.getAllByClientId(this.clientId).subscribe({
      next: (projects) => {
        console.log('SelectListProjectComponent: fetched projects', projects);
        this.selectListProjectStore.setProjects(projects);
      },
      error: (error) => {
        this.selectListProjectStore.setError('Error loading projects');
        console.error('SelectListProjectComponent: error fetching projects', error);
      }
    });
  }

  protected selectProject($event: ProjectEntity) {
    console.log('SelectListProjectComponent: selected project', $event);
    this.selectListProjectStore.setProjectSelected($event);
  }

  protected navigateToServiceList() {
    const project = this.selectListProjectStore.projectSelected!();
    if (project) {
      this.contextStore.setProject(project);
      this.router.navigate(['/dashboard']).then(() => {});
    }
  }

  protected goBack() {
    this.location.back();
  }
}

import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsStore } from '../../model/projects.store';
import { ProjectStatusEnum } from '../../../../entities/project/model/project-status.enum';
import { Ripple } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import {ProjectBanner} from '../project-banner/project-banner';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, Ripple, FormsModule, ProjectBanner],
  standalone: true,
  templateUrl: './projects.page.html'
})
export class ProjectsPage implements OnInit, OnDestroy {
  readonly store = inject(ProjectsStore);
  private readonly router = inject(Router);

  // UI state - SOLO estado de UI
  readonly searchQuery = signal('');

  // Computed - Proyectos filtrados
  readonly filteredProjects = computed(() => {
    return this.store.filteredProjects();
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  loadProjects(): void {
    this.store.loadAllData();
  }

  onProjectSelect(projectId: string): void {
    this.store.selectProject(projectId);
    this.router.navigate(['/projects', projectId]).then(() => {});
  }

  onCreateProject(): void {
    this.router.navigate(['/projects/new']).then(() => {});
  }

  onEditProject(projectId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/projects', projectId, 'edit']).then(() => {});
  }

  onRefresh(): void {
    this.searchQuery.set('');
    this.store.clearFilters();
    this.store.loadAllData();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.store.setSearchQuery('');
  }

  onStatusFilterChange(status: ProjectStatusEnum | null): void {
    this.store.setStatusFilter(status);
  }

  clearStatusFilter(): void {
    this.store.setStatusFilter(null);
  }

  getStatusClass(status: ProjectStatusEnum): string {
    switch (status) {
      case ProjectStatusEnum.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case ProjectStatusEnum.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatusEnum.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ProjectStatusEnum.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatusEnum.PLANNED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: ProjectStatusEnum): string {
    switch (status) {
      case ProjectStatusEnum.IN_PROGRESS:
        return 'pi-check-circle';
      case ProjectStatusEnum.COMPLETED:
        return 'pi-check';
      case ProjectStatusEnum.CANCELLED:
        return 'pi-times-circle';
      case ProjectStatusEnum.ON_HOLD:
        return 'pi-pause-circle';
      case ProjectStatusEnum.PLANNED:
        return 'pi-clock';
      default:
        return 'pi-question-circle';
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No definida';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }
}

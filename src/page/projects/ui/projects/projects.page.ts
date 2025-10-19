import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {FilterDrawerComponent} from '../filter-drawer/filter-drawer.component';
import {ProjectsStore} from '../../model/projects.store';
import {ProjectStatusEnum} from '../../../../entities/project/model/project-status.enum';
import {EquipmentTypeEnum} from '../../../../shared/model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, ProjectCardComponent, FilterDrawerComponent],
  templateUrl: './projects.page.html'
})
export class ProjectsPage implements OnInit {
  readonly store = inject(ProjectsStore);
  private readonly router = inject(Router);

  // UI State
  readonly filterDrawerVisible = signal(false);

  // Search
  searchQuery = '';

  // Expose enums
  readonly ProjectStatusEnum = ProjectStatusEnum;

  ngOnInit(): void {
    this.store.loadAllData();
  }

  // ==================== SEARCH ====================

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.store.setSearchQuery(value);
  }

  // ==================== FILTERS ====================

  onOpenFilters(): void {
    this.filterDrawerVisible.set(true);
  }

  onFilterDrawerVisibleChange(visible: boolean): void {
    this.filterDrawerVisible.set(visible);
  }

  onStatusFilterChange(status: ProjectStatusEnum | null): void {
    this.store.setStatusFilter(status);
  }

  onClientFilterChange(clientId: string | null): void {
    this.store.setClientFilter(clientId);
  }

  onEquipmentTypeFilterChange(equipmentType: EquipmentTypeEnum | null): void {
    this.store.setEquipmentTypeFilter(equipmentType);
  }

  onClearFilters(): void {
    this.store.clearFilters();
  }

  onApplyFilters(): void {
    // Los filtros ya se aplicaron en tiempo real
    // Este método es solo para cerrar el drawer
  }

  // ==================== ACTIONS ====================

  onProjectClick(projectId: string): void {
    this.router.navigate(['/projects', projectId]).then(() => {});
  }

  onCreateProject(): void {
    this.router.navigate(['/projects/new']).then(() => {});
  }

  onRefresh(): void {
    this.store.loadAllData();
  }

  // ==================== HELPERS ====================

  hasActiveFilters(): boolean {
    return this.store.selectedStatus() !== null ||
      this.store.selectedClientId() !== null ||
      this.store.selectedEquipmentType() !== null;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.store.selectedStatus() !== null) count++;
    if (this.store.selectedClientId() !== null) count++;
    if (this.store.selectedEquipmentType() !== null) count++;
    return count;
  }

  getStatusCount(status: ProjectStatusEnum): number {
    return this.store.projectsCountByStatus()[status] || 0;
  }
}

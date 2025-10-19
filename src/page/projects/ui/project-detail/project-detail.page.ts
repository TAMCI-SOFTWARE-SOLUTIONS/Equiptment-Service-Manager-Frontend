import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import {ProjectDetailStore} from '../../model/project-detail.store';
import {ProjectsStore} from '../../model/projects.store';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, Ripple, Menu],
  providers: [ProjectDetailStore],
  templateUrl: './project-detail.page.html'
})
export class ProjectDetailPage implements OnInit, OnDestroy {
  readonly store = inject(ProjectDetailStore);
  readonly projectsStore = inject(ProjectsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI State
  readonly showDeleteConfirm = signal(false);

  // Menu items para "Más opciones"
  moreActionsItems: MenuItem[] = [];

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      this.store.loadProject(projectId);
    } else {
      this.router.navigate(['/projects']).then(() => {});
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== ACTIONS ====================

  onBack(): void {
    this.router.navigate(['/projects']).then(() => {});
  }

  onEdit(): void {
    const project = this.store.project();
    if (!project) return;

    this.router.navigate(['/projects', project.id, 'edit']).then(() => {});
  }

  onRefresh(): void {
    const project = this.store.project();
    if (!project) return;

    this.store.loadProject(project.id);
  }

  // ==================== STATUS CHANGES ====================

  /**
   * TODO: Iniciar proyecto
   */
  async onStartProject(): Promise<void> {
    console.log('🚧 TODO: Implementar inicio de proyecto');
    const success = await this.store.startProject();

    if (success) {
      const project = this.store.project();
      if (project) {
        this.projectsStore.updateProject(project);
      }
    }
  }

  /**
   * TODO: Completar proyecto
   */
  async onCompleteProject(): Promise<void> {
    console.log('🚧 TODO: Implementar completar proyecto');
    const success = await this.store.completeProject();

    if (success) {
      const project = this.store.project();
      if (project) {
        this.projectsStore.updateProject(project);
      }
    }
  }

  /**
   * TODO: Pausar proyecto
   */
  async onPauseProject(): Promise<void> {
    console.log('🚧 TODO: Implementar pausar proyecto');
    const success = await this.store.pauseProject();

    if (success) {
      const project = this.store.project();
      if (project) {
        this.projectsStore.updateProject(project);
      }
    }
  }

  /**
   * TODO: Cancelar proyecto
   */
  async onCancelProject(): Promise<void> {
    console.log('🚧 TODO: Implementar cancelar proyecto');
    const success = await this.store.cancelProject();

    if (success) {
      const project = this.store.project();
      if (project) {
        this.projectsStore.updateProject(project);
      }
    }
  }

  /**
   * TODO: Eliminar proyecto
   */
  async onDeleteProject(): Promise<void> {
    this.showDeleteConfirm.set(true);
  }

  async onConfirmDelete(): Promise<void> {
    console.log('🚧 TODO: Implementar eliminar proyecto');
    const success = await this.store.deleteProject();

    if (success) {
      const project = this.store.project();
      if (project) {
        this.projectsStore.removeProject(project.id);
      }
      this.router.navigate(['/projects']).then(() => {});
    }

    this.showDeleteConfirm.set(false);
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  // ==================== MENU ====================

  /**
   * Construir items del menú "Más opciones"
   */
  buildMoreActionsMenu(): MenuItem[] {
    const items: MenuItem[] = [];

    // Iniciar Proyecto (solo si está PLANNED)
    if (this.store.canStartProject()) {
      items.push({
        label: 'Iniciar Proyecto',
        icon: 'pi pi-play',
        command: () => {
          console.log('🚧 TODO: Iniciar proyecto');
          this.onStartProject();
        }
      });
    }

    // Acciones para IN_PROGRESS
    if (this.store.canCompleteProject() || this.store.canPauseProject() || this.store.canCancelProject()) {
      if (items.length > 0) {
        items.push({ separator: true });
      }

      if (this.store.canCompleteProject()) {
        items.push({
          label: 'Completar Proyecto',
          icon: 'pi pi-check-circle',
          command: () => {
            console.log('🚧 TODO: Completar proyecto');
            this.onCompleteProject();
          }
        });
      }

      if (this.store.canPauseProject()) {
        items.push({
          label: 'Pausar Proyecto',
          icon: 'pi pi-pause-circle',
          command: () => {
            console.log('🚧 TODO: Pausar proyecto');
            this.onPauseProject();
          }
        });
      }

      if (this.store.canCancelProject()) {
        items.push({
          label: 'Cancelar Proyecto',
          icon: 'pi pi-times-circle',
          command: () => {
            console.log('🚧 TODO: Cancelar proyecto');
            this.onCancelProject();
          }
        });
      }
    }

    // Eliminar (solo si está PLANNED)
    if (this.store.canDeleteProject()) {
      if (items.length > 0) {
        items.push({ separator: true });
      }

      items.push({
        label: 'Eliminar Proyecto',
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        command: () => {
          this.onDeleteProject();
        }
      });
    }

    // Si no hay acciones disponibles, mostrar mensaje
    if (items.length === 0) {
      items.push({
        label: 'No hay acciones disponibles',
        icon: 'pi pi-info-circle',
        disabled: true
      });
    }

    return items;
  }

  /**
   * Toggle menú de acciones
   */
  toggleActionsMenu(event: Event, menu: Menu): void {
    this.moreActionsItems = this.buildMoreActionsMenu();
    menu.toggle(event);
  }

  // ==================== HELPERS ====================

  formatDate(date: Date | null): string {
    if (!date) return 'No establecida';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }
}

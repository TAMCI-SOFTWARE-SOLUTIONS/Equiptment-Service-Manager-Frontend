import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import {CollaboratorDetailStore} from '../../model/store/collaborator-detail.store';

@Component({
  selector: 'app-collaborator-detail',
  standalone: true,
  imports: [CommonModule, Ripple, Menu],
  providers: [CollaboratorDetailStore],
  templateUrl: './collaborator-detail.page.html'
})
export class CollaboratorDetailPage implements OnInit, OnDestroy {
  readonly store = inject(CollaboratorDetailStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI State
  readonly showActionsMenu = signal(false);

  // Menu items para "Más acciones"
  moreActionsItems: MenuItem[] = [];

  ngOnInit(): void {
    const profileId = this.route.snapshot.paramMap.get('id');

    if (profileId) {
      this.store.loadProfile(profileId);
    } else {
      this.router.navigate(['/collaborators']).then(() => {});
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== ACTIONS ====================

  onBack(): void {
    this.router.navigate(['/collaborators']).then(() => {});
  }

  onEdit(): void {
    const profile = this.store.profile();
    if (!profile) return;

    this.router.navigate(['/collaborators', profile.id, 'edit']).then(() => {});
  }

  onRefresh(): void {
    const profile = this.store.profile();
    if (!profile) return;

    this.store.loadProfile(profile.id);
  }

  /**
   * TODO: Generar usuario
   */
  async onGenerateUser(): Promise<void> {
    console.log('🚧 TODO: Implementar generación de usuario');
    const success = await this.store.generateUser();

    if (success) {
      // Recargar perfil para ver el userId actualizado
      const profile = this.store.profile();
      if (profile) {
        this.store.loadProfile(profile.id);
      }
    }
  }

  /**
   * TODO: Suspender colaborador
   */
  async onSuspendCollaborator(): Promise<void> {
    console.log('🚧 TODO: Implementar suspensión de colaborador');
    const success = await this.store.suspendCollaborator();

    if (success) {
      // Recargar perfil
      const profile = this.store.profile();
      if (profile) {
        this.store.loadProfile(profile.id);
      }
    }
  }

  /**
   * Construir items del menú "Más acciones"
   */
  buildMoreActionsMenu(): MenuItem[] {
    const hasUser = this.store.hasUser();

    return [
      {
        label: 'Generar Usuario',
        icon: 'pi pi-user-plus',
        disabled: hasUser, // Deshabilitado si ya tiene usuario
        visible: !hasUser, // Solo visible si NO tiene usuario
        command: () => {
          // TODO: Implementar cuando backend esté listo
          console.log('🚧 TODO: Generar usuario');
          this.onGenerateUser();
        }
      },
      {
        separator: true,
        visible: !hasUser
      },
      {
        label: 'Suspender Colaborador',
        icon: 'pi pi-ban',
        disabled: true, // TODO: Habilitar cuando backend esté listo
        command: () => {
          // TODO: Implementar cuando backend esté listo
          console.log('🚧 TODO: Suspender colaborador');
          this.onSuspendCollaborator();
        }
      },
      {
        label: 'Reactivar Colaborador',
        icon: 'pi pi-check-circle',
        disabled: true, // TODO: Habilitar cuando backend esté listo
        visible: false, // TODO: Mostrar solo si está suspendido
        command: () => {
          // TODO: Implementar cuando backend esté listo
          console.log('🚧 TODO: Reactivar colaborador');
        }
      },
      {
        separator: true
      },
      {
        label: 'Resetear Contraseña',
        icon: 'pi pi-key',
        disabled: true, // TODO: Habilitar cuando backend esté listo
        visible: hasUser, // Solo visible si tiene usuario
        command: () => {
          // TODO: Implementar cuando backend esté listo
          console.log('🚧 TODO: Resetear contraseña');
        }
      }
    ];
  }

  /**
   * Toggle menú de acciones
   */
  toggleActionsMenu(event: Event, menu: Menu): void {
    this.moreActionsItems = this.buildMoreActionsMenu();
    menu.toggle(event);
  }

  // ==================== HELPERS ====================

  getAvatarGradient(): string {
    // Generar un gradiente único basado en el nombre
    const profile = this.store.profile();
    if (!profile) return 'from-sky-400 to-cyan-500';

    const colors = [
      'from-sky-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-green-400 to-emerald-500',
      'from-orange-400 to-red-500',
      'from-indigo-400 to-blue-500',
      'from-yellow-400 to-orange-500'
    ];

    const hash = profile.names.charCodeAt(0) + profile.firstSurname.charCodeAt(0);
    return colors[hash % colors.length];
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutStore } from '../../../shared/model/layout.store';
import { ContextStore } from '../../../shared/model/context.store';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    Avatar,
    Ripple
  ],
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  readonly layoutStore = inject(LayoutStore);
  readonly contextStore = inject(ContextStore);
  private readonly router = inject(Router);

  // Usar directamente los signals del ContextStore
  clienteActual = this.contextStore.client;
  proyectoActual = this.contextStore.project;

  // Usuario actual (mock - reemplaza con AuthService)
  usuarioActual = {
    nombre: 'Juan Pérez',
    rol: 'Supervisor',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
  };

  // Control de dropdowns
  showContextSelector = signal(false);
  showUserMenu = signal(false);

  onMenuClick(): void {
    this.layoutStore.openSidebar();
  }

  toggleContextSelector(): void {
    this.showContextSelector.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showContextSelector.set(false);
  }

  cambiarContexto(): void {
    this.showContextSelector.set(false);
    // Navegar a la página de selección de clientes
    this.router.navigate(['/clients']).then(() => {});
  }

  cerrarSesion(): void {
    // Limpiar el contexto guardado
    this.contextStore.clearContext();

    // TODO: Implementar logout real (AuthService)
    // this.authService.logout();

    this.router.navigate(['/login']);
  }
}

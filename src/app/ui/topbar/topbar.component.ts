import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutStore } from '../../../shared/model/layout.store';
import { ContextStore } from '../../../shared/model/context.store';
import { ProfileStore } from '../../../shared/stores';
import { AuthStore } from '../../../shared/stores';
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
   readonly profileStore = inject(ProfileStore);
   readonly authStore = inject(AuthStore);
   private readonly router = inject(Router);

   // Usar directamente los signals del ContextStore
   clienteActual = this.contextStore.client;
   proyectoActual = this.contextStore.project;

   // Usar ProfileStore para información del usuario
   usuarioActual = {
     nombre: this.profileStore.displayName,
     rol: this.profileStore.userRole,
     avatar: this.profileStore.profileImageUrl
   };

   // Signals para mostrar estados de carga
   isProfileLoading = this.profileStore.isProfileLoading;
   hasProfile = this.profileStore.hasProfile;

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

    // Limpiar el perfil
    this.profileStore.clearProfile();

    // Usar AuthStore para cerrar sesión
    this.authStore.signOut();
  }
}

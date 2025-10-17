import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {ProfileViewComponent} from '../profile-view/profile-view.component';
import {ProfileFormComponent} from '../profile-form/profile-form.component';
import {ProfileStore} from '../../model/store/profile.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileViewComponent,
    ProfileFormComponent,
    Ripple,
    Toast
  ],
  providers: [ProfileStore, MessageService],
  templateUrl: './profile.page.html'
})
export class ProfilePage implements OnInit {
  readonly store = inject(ProfileStore);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.loadProfile().then();
  }

  async loadProfile(): Promise<void> {
    await this.store.loadProfile();
  }

  toggleEditMode(): void {
    this.store.toggleEditMode();
  }

  async onSave(): Promise<void> {
    const success = await this.store.save();

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Perfil Actualizado',
        detail: 'Tu información se ha guardado correctamente',
        life: 3000
      });
    } else if (this.store.error()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.store.error() || 'No se pudo guardar el perfil',
        life: 5000
      });
    }
  }

  onCancel(): void {
    if (this.store.hasChanges()) {
      // TODO: Mostrar confirmación si hay cambios sin guardar
      // Por ahora solo cancela
      this.toggleEditMode();
    } else {
      this.toggleEditMode();
    }
  }
}

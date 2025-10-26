import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupervisorsStore } from '../../model/supervisors.store';
import { Ripple } from 'primeng/ripple';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {SupervisorEntity} from '../../../../entities/supervisor';

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    EmptyStateComponent,
    Ripple
  ],
  providers: [SupervisorsStore],
  templateUrl: './supervisors.page.html'
})
export class SupervisorsPage implements OnInit {
  readonly store = inject(SupervisorsStore);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly supervisorToDelete = signal<SupervisorEntity | null>(null);
  readonly isDeleting = signal(false);
  readonly showCreateForm = signal(false);
  readonly newSupervisorName = signal('');
  readonly editingName = signal('');

  ngOnInit(): void {
    this.store.loadSupervisors();
  }

  onCreateNew(): void {
    this.showCreateForm.set(true);
    this.newSupervisorName.set('');
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('#new-supervisor-input');
      input?.focus();
    }, 100);
  }

  onCancelCreate(): void {
    this.showCreateForm.set(false);
    this.newSupervisorName.set('');
  }

  async onSaveNew(): Promise<void> {
    const name = this.newSupervisorName().trim();
    if (!name || name.length < 3) return;

    const success = await this.store.createSupervisor(name);
    if (success) {
      this.showCreateForm.set(false);
      this.newSupervisorName.set('');
    }
  }

  onEdit(supervisor: SupervisorEntity): void {
    this.store.setEditing(supervisor.id);
    this.editingName.set(supervisor.fullName);
    // Focus en el input después de que se renderice
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`#edit-supervisor-${supervisor.id}`);
      input?.focus();
      input?.select();
    }, 100);
  }

  onCancelEdit(): void {
    this.store.setEditing(null);
    this.editingName.set('');
  }

  async onSaveEdit(id: string): Promise<void> {
    const name = this.editingName().trim();
    if (!name || name.length < 3) return;

    const success = await this.store.updateSupervisor(id, name);
    if (success) {
      this.editingName.set('');
    }
  }

  onDeleteClick(supervisor: SupervisorEntity): void {
    this.supervisorToDelete.set(supervisor);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const supervisor = this.supervisorToDelete();
    if (!supervisor) return;

    this.isDeleting.set(true);

    const success = await this.store.deleteSupervisor(supervisor.id);

    if (success) {
      this.closeDeleteModal();
    }

    this.isDeleting.set(false);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.supervisorToDelete.set(null);
    this.isDeleting.set(false);
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.setSearchQuery('');
  }

  onRefresh(): void {
    this.store.loadSupervisors();
  }

  isEditing(id: string): boolean {
    return this.store.editingId() === id;
  }

  onKeyDownCreate(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSaveNew().then();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancelCreate();
    }
  }

  onKeyDownEdit(event: KeyboardEvent, id: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSaveEdit(id).then();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancelEdit();
    }
  }
}

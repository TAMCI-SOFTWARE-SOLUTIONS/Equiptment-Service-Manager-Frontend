import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {CommunicationProtocolsStore} from '../../model/store/communication-protocols.store';
import {CommunicationProtocolEntity} from '../../../../entities/communication-protocol/model';

@Component({
  selector: 'app-communication-protocols',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    EmptyStateComponent,
    Ripple
  ],
  templateUrl: './communication-protocols.page.html'
})
export class CommunicationProtocolsPage implements OnInit {
  readonly store = inject(CommunicationProtocolsStore);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly protocolToDelete = signal<CommunicationProtocolEntity | null>(null);
  readonly isDeleting = signal(false);
  readonly showCreateForm = signal(false);
  readonly newProtocolName = signal('');
  readonly editingName = signal('');

  ngOnInit(): void {
    this.store.loadProtocols();
  }

  onCreateNew(): void {
    this.showCreateForm.set(true);
    this.newProtocolName.set('');
  }

  onCancelCreate(): void {
    this.showCreateForm.set(false);
    this.newProtocolName.set('');
  }

  async onSaveNew(): Promise<void> {
    const name = this.newProtocolName().trim();
    if (!name) return;

    const success = await this.store.createProtocol(name);
    if (success) {
      this.showCreateForm.set(false);
      this.newProtocolName.set('');
    }
  }

  onEdit(protocol: CommunicationProtocolEntity): void {
    this.store.setEditing(protocol.id);
    this.editingName.set(protocol.name);
  }

  onCancelEdit(): void {
    this.store.setEditing(null);
    this.editingName.set('');
  }

  async onSaveEdit(id: string): Promise<void> {
    const name = this.editingName().trim();
    if (!name) return;

    const success = await this.store.updateProtocol(id, name);
    if (success) {
      this.editingName.set('');
    }
  }

  onDeleteClick(protocol: CommunicationProtocolEntity): void {
    this.protocolToDelete.set(protocol);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const protocol = this.protocolToDelete();
    if (!protocol) return;

    this.isDeleting.set(true);

    const success = await this.store.deleteProtocol(protocol.id);

    if (success) {
      this.closeDeleteModal();
    }

    this.isDeleting.set(false);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.protocolToDelete.set(null);
    this.isDeleting.set(false);
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.setSearchQuery('');
  }

  onRefresh(): void {
    this.store.loadProtocols();
  }

  isEditing(id: string): boolean {
    return this.store.editingId() === id;
  }
}

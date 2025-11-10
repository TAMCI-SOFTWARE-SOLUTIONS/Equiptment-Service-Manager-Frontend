import {Component, model, output} from '@angular/core';
import {RippleModule} from 'primeng/ripple';
import {CommonModule} from '@angular/common';
import {Dialog} from 'primeng/dialog';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, Dialog, RippleModule],
  templateUrl: './success-modal.component.html'
})
export class SuccessModalComponent {
  readonly visible = model.required<boolean>();
  readonly navigateToDashboard = output<void>();
  readonly navigateToCreateService = output<void>();

  onDashboard(): void {
    this.navigateToDashboard.emit();
  }

  onCreateService(): void {
    this.navigateToCreateService.emit();
  }
}

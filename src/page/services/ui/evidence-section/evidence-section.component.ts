import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-evidence-section',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card [header]="title">
      <ng-content></ng-content>
    </p-card>
  `
})
export class EvidenceSectionComponent {
  @Input() title: string = '';
}

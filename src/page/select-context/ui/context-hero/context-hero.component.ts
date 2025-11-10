import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SelectContextStep} from '../../model/stores/select-context.store';

@Component({
  selector: 'app-context-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-hero.component.html'
})
export class ContextHeroComponent {
  readonly currentStep = input.required<SelectContextStep>();
  readonly selectedClientName = input<string | null>(null);

  readonly SelectContextStep = SelectContextStep;
}

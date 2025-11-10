import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SelectContextStep} from '../../model/stores/select-context.store';
import {IconEntity} from '../../../../shared/model/enums/icon-entity.enum';
import {IconSize} from '../../../../shared/model/enums/icon-size.enum';
import {EntityIconComponent} from '../../../../shared/ui/entity-icon/entity-icon.component';
import {IconRounded} from '../../../../shared/model/enums/icon.rounded';

@Component({
  selector: 'app-context-hero',
  standalone: true,
  imports: [CommonModule, EntityIconComponent],
  templateUrl: './context-hero.component.html'
})
export class ContextHeroComponent {
  readonly currentStep = input.required<SelectContextStep>();
  readonly selectedClientName = input<string | null>(null);

  readonly SelectContextStep = SelectContextStep;
  readonly IconEntity = IconEntity;
  readonly IconSize = IconSize;
  readonly IconRounded = IconRounded;
}

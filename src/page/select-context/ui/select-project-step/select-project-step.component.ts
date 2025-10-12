import {Component, inject} from '@angular/core';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';
import {SelectContextStore} from '../../../../shared/model/select-context.store';
import {ProjectWithBannerItemComponent} from '../../../../features/select-list-project/ui/project-with-banner-item/project-with-banner-item.component';

@Component({
  selector: 'app-select-project-step',
  imports: [
    ProjectWithBannerItemComponent
  ],
  templateUrl: './select-project-step.component.html',
  styleUrl: './select-project-step.component.css'
})
export class SelectProjectStepComponent {
  readonly store = inject(SelectContextStore);

  onSelectProject(project: ProjectEntity): void {
    this.store.selectProject(project);
  }
}

import {Component, inject} from '@angular/core';
import {ClientEntity} from '../../../../entities/client/model';
import {SelectContextStore} from '../../../../shared/model/select-context.store';

@Component({
  selector: 'app-select-client-step',
  imports: [],
  templateUrl: './select-client-step.component.html',
  styleUrl: './select-client-step.component.css'
})
export class SelectClientStepComponent {
  readonly store = inject(SelectContextStore);

  onSelectClient(client: ClientEntity): void {
    this.store.selectClient(client);
  }
}

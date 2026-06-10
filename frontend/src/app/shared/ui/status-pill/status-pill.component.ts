import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.css',
})
export class StatusPillComponent {
  readonly active = input.required<boolean>();
  readonly activeText = input('Active');
  readonly inactiveText = input('Inactive');
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  template: `<span class="pill" [class.off]="!active()">{{ active() ? activeText() : inactiveText() }}</span>`,
  styles: `
    .pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      background: #dff6ed;
      color: #0d6b52;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .off {
      background: #eef1f0;
      color: #697c76;
    }
  `,
})
export class StatusPillComponent {
  readonly active = input.required<boolean>();
  readonly activeText = input('Active');
  readonly inactiveText = input('Inactive');
}

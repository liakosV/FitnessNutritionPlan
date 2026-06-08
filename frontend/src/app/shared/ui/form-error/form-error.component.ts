import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-error',
  template: `
    @if (message()) {
      <p class="error">{{ message() }}</p>
    }
  `,
  styles: `
    .error {
      margin: 0;
      border: 1px solid #f1b8b8;
      border-radius: 8px;
      background: #fff4f4;
      color: #9f2525;
      padding: 12px 14px;
      line-height: 1.5;
    }
  `,
})
export class FormErrorComponent {
  readonly message = input('');
}

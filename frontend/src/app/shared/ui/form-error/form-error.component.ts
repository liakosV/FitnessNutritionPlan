import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.css',
})
export class FormErrorComponent {
  readonly message = input('');
}

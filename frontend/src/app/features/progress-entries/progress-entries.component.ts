import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { ApiErrorService } from '../../core/api/api-error.service';
import { ProgressEntriesApiService } from '../../core/api/progress-entries-api.service';
import { ProgressEntryReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-progress-entries',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './progress-entries.component.html',
  styleUrl: './progress-entries.component.css',
})
export class ProgressEntriesComponent implements OnInit {
  private readonly api = inject(ProgressEntriesApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);

  protected readonly columns = ['date', 'weight', 'bodyFat', 'notes', 'actions'];
  protected readonly entries = signal<ProgressEntryReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly form = new FormGroup({
    weight: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.1)] }),
    bodyFat: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    notes: new FormControl('', { nonNullable: true }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    this.loadEntries();
  }

  protected loadEntries(): void {
    this.loading.set(true);
    this.api.getMine().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notification.error(this.apiError.message(error));
      },
    });
  }

  protected createEntry(): void {
    this.formError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.saving = true;
    this.api
      .createMine({
        weight: value.weight,
        bodyFat: value.bodyFat,
        notes: value.notes || undefined,
      })
      .subscribe({
        next: (entry) => {
          this.entries.update((entries) => [entry, ...entries]);
          this.form.reset({ weight: 0, bodyFat: 0, notes: '' });
          this.saving = false;
          this.notification.success('Progress entry added.');
        },
        error: (error: unknown) => {
          this.formError = this.apiError.message(error);
          this.saving = false;
        },
      });
  }

  protected deleteEntry(entry: ProgressEntryReadDto): void {
    const confirmed = window.confirm(`Delete progress entry from ${entry.date}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(entry.uuid).subscribe({
      next: () => {
        this.entries.update((entries) => entries.filter((item) => item.uuid !== entry.uuid));
        this.notification.success('Progress entry deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}

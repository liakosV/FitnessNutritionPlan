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
  template: `
    <app-page-header
      title="Progress Entries"
      description="Uses /api/users/me/progress-entries so entries are automatically attached to the authenticated user."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>New progress entry</mat-card-title>
          <mat-card-subtitle>Date is assigned by the backend.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="createEntry()">
            <app-form-error [message]="formError" />
            <mat-form-field appearance="outline">
              <mat-label>Weight</mat-label>
              <input matInput type="number" min="0.1" formControlName="weight" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Body fat</mat-label>
              <input matInput type="number" min="0" formControlName="bodyFat" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="4"></textarea>
            </mat-form-field>
            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Add entry' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined" class="list-card">
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        }

        <div class="table-wrap">
          <table mat-table [dataSource]="entries()">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let entry">{{ entry.date }}</td>
            </ng-container>
            <ng-container matColumnDef="weight">
              <th mat-header-cell *matHeaderCellDef>Weight</th>
              <td mat-cell *matCellDef="let entry">{{ entry.weight }}</td>
            </ng-container>
            <ng-container matColumnDef="bodyFat">
              <th mat-header-cell *matHeaderCellDef>Body fat</th>
              <td mat-cell *matCellDef="let entry">{{ entry.bodyFat }}</td>
            </ng-container>
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let entry">{{ entry.notes || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let entry">
                <button mat-button color="warn" type="button" (click)="deleteEntry(entry)">Delete</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        @if (!loading() && entries().length === 0) {
          <p class="empty">No progress entries yet.</p>
        }
      </mat-card>
    </section>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: minmax(300px, 380px) 1fr;
      gap: 18px;
      align-items: start;
    }

    mat-card {
      border-color: #c8ddd5;
    }

    form {
      display: grid;
      gap: 16px;
      padding-top: 18px;
    }

    .list-card {
      overflow: hidden;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `,
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

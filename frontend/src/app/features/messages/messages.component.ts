import { Component, inject, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { ApiErrorService } from '../../core/api/api-error.service';
import { MessagesApiService } from '../../core/api/messages-api.service';
import { MessageReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-messages',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTabsModule,
    NgTemplateOutlet,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  template: `
    <app-page-header
      title="Messages"
      description="Uses the authenticated user's sent, received, and conversation endpoints."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Send message</mat-card-title>
          <mat-card-subtitle>Receiver UUID is required by MessageInsertDto.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="sendForm" (ngSubmit)="sendMessage()">
            <app-form-error [message]="sendError" />
            <mat-form-field appearance="outline">
              <mat-label>Receiver UUID</mat-label>
              <input matInput formControlName="receiverUuid" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="5"></textarea>
            </mat-form-field>
            <button mat-flat-button type="submit" [disabled]="sending">
              {{ sending ? 'Sending...' : 'Send message' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Conversation lookup</mat-card-title>
          <mat-card-subtitle>Loads /api/messages/conversation/:otherUserUuid.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="conversationForm" (ngSubmit)="loadConversation()">
            <app-form-error [message]="conversationError" />
            <mat-form-field appearance="outline">
              <mat-label>Other user UUID</mat-label>
              <input matInput formControlName="otherUserUuid" />
            </mat-form-field>
            <button mat-flat-button type="submit">Load conversation</button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>

    <mat-card appearance="outlined" class="messages-card">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <mat-tab-group>
        <mat-tab label="Received">
          <ng-container *ngTemplateOutlet="messageList; context: { messages: received() }" />
        </mat-tab>
        <mat-tab label="Sent">
          <ng-container *ngTemplateOutlet="messageList; context: { messages: sent() }" />
        </mat-tab>
        <mat-tab label="Conversation">
          <ng-container *ngTemplateOutlet="messageList; context: { messages: conversation() }" />
        </mat-tab>
      </mat-tab-group>
    </mat-card>

    <ng-template #messageList let-messages="messages">
      <div class="message-list">
        @for (message of messages; track message.uuid) {
          <article>
            <div>
              <strong>{{ message.senderUsername }}</strong>
              <span>to {{ message.receiverUsername }} · {{ message.timestamp }}</span>
            </div>
            <p>{{ message.content }}</p>
            <button mat-button color="warn" type="button" (click)="deleteMessage(message)">Delete</button>
          </article>
        } @empty {
          <p class="empty">No messages in this view.</p>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
      margin-bottom: 18px;
    }

    mat-card {
      border-color: #c8ddd5;
    }

    form {
      display: grid;
      gap: 16px;
      padding-top: 18px;
    }

    .messages-card {
      overflow: hidden;
    }

    .message-list {
      display: grid;
      gap: 12px;
      padding: 18px;
    }

    article {
      display: grid;
      gap: 8px;
      border: 1px solid #dcebe6;
      border-radius: 8px;
      background: #fbfffd;
      padding: 14px;
    }

    article div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: space-between;
    }

    article span,
    .empty {
      color: #526b62;
    }

    article p {
      margin: 0;
      line-height: 1.55;
    }

    article button {
      justify-self: end;
    }

    .empty {
      margin: 0;
      padding: 12px 0;
    }
  `,
})
export class MessagesComponent implements OnInit {
  private readonly api = inject(MessagesApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);

  protected readonly received = signal<MessageReadDto[]>([]);
  protected readonly sent = signal<MessageReadDto[]>([]);
  protected readonly conversation = signal<MessageReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly sendForm = new FormGroup({
    receiverUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly conversationForm = new FormGroup({
    otherUserUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected sending = false;
  protected sendError = '';
  protected conversationError = '';

  ngOnInit(): void {
    this.loadMailboxes();
  }

  protected loadMailboxes(): void {
    this.loading.set(true);
    this.api.getReceived().subscribe({
      next: (messages) => {
        this.received.set(messages);
        this.loadSent();
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notification.error(this.apiError.message(error));
      },
    });
  }

  protected sendMessage(): void {
    this.sendError = '';
    this.sendForm.markAllAsTouched();

    if (this.sendForm.invalid) {
      return;
    }

    this.sending = true;
    this.api.send(this.sendForm.getRawValue()).subscribe({
      next: (message) => {
        this.sent.update((messages) => [message, ...messages]);
        this.sendForm.reset();
        this.sending = false;
        this.notification.success('Message sent.');
      },
      error: (error: unknown) => {
        this.sendError = this.apiError.message(error);
        this.sending = false;
      },
    });
  }

  protected loadConversation(): void {
    this.conversationError = '';
    this.conversationForm.markAllAsTouched();

    if (this.conversationForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.api.getConversation(this.conversationForm.controls.otherUserUuid.value).subscribe({
      next: (messages) => {
        this.conversation.set(messages);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.conversationError = this.apiError.message(error);
        this.loading.set(false);
      },
    });
  }

  protected deleteMessage(message: MessageReadDto): void {
    const confirmed = window.confirm('Delete this message?');
    if (!confirmed) {
      return;
    }

    this.api.delete(message.uuid).subscribe({
      next: () => {
        this.received.update((messages) => messages.filter((entry) => entry.uuid !== message.uuid));
        this.sent.update((messages) => messages.filter((entry) => entry.uuid !== message.uuid));
        this.conversation.update((messages) => messages.filter((entry) => entry.uuid !== message.uuid));
        this.notification.success('Message deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  private loadSent(): void {
    this.api.getSent().subscribe({
      next: (messages) => {
        this.sent.set(messages);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notification.error(this.apiError.message(error));
      },
    });
  }
}

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
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
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

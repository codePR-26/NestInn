import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../core/services/message.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

import { Message } from '../../core/models/message.model';
import { Booking } from '../../core/models/booking.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('msgEnd') msgEnd!: ElementRef;

  msgSvc = inject(MessageService);
  bookingSvc = inject(BookingService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);

  messages = signal<Message[]>([]);
  booking = signal<Booking | null>(null);

  newMsg = '';
  loading = false;
  bookingId = 0;
  pollInterval: any;

  ngOnInit() {

    this.bookingId = +this.route.snapshot.params['bookingId'];

    this.bookingSvc.getById(this.bookingId).subscribe({
      next: b => this.booking.set(b),
      error: () => {}
    });

    this.loadMessages();

    // polling every 5 seconds
    this.pollInterval = setInterval(() => {
      this.loadMessages();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadMessages() {
    this.msgSvc.getByBooking(this.bookingId).subscribe({
      next: (res: any) => {
        this.messages.set(res.data || []);

        // scroll after loading
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {}
    });
  }

  scrollToBottom() {
    try {
      this.msgEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  send() {

    if (!this.newMsg.trim()) return;

    const payload = {
      bookingId: this.bookingId,
      content: this.newMsg.trim()
    };

    this.msgSvc.send(payload).subscribe({
      next: (res: any) => {

        this.messages.update(ms => [...ms, res.data]);

        this.newMsg = '';

        // scroll after sending
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.toast.error('Failed to send message')
    });
  }

  isMine(m: Message) {
    return m.senderId === this.auth.userId;
  }
}
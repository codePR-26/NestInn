import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MessageService } from '../../core/services/message.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
<div class="chat-page">
  <!-- Header -->
  <div class="chat-header">
    <div class="chat-header-inner container">
      <a routerLink="/bookings" class="back-btn">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <div class="chat-info">
        <div class="chat-title">{{ booking()?.propertyTitle || ('Booking #' + bookingId) }}</div>
        <div class="chat-sub">
          @if(booking()?.propertyCity){ 📍 {{ booking()?.propertyCity }} · }
          Booking #{{ bookingId }}
        </div>
      </div>
      <div class="chat-live">
        <span class="live-dot"></span>
        <span class="live-label">Live</span>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div class="container chat-body">
    <div class="chat-box">

      <!-- Messages -->
      <div class="messages-area" #msgContainer>
        @if(loading()){
          <div class="chat-loading"><mat-spinner diameter="36"></mat-spinner></div>
        } @else if(messages().length === 0){
          <div class="chat-empty">
            <span class="chat-empty-icon">💬</span>
            <h3>No messages yet</h3>
            <p>Start the conversation!</p>
          </div>
        } @else {
          @for(m of messages(); track m.messageId){
            <div class="msg-row" [class.mine]="isMine(m)">
              @if(!isMine(m)){
                <div class="msg-avatar">{{ (m.senderName||'H').charAt(0).toUpperCase() }}</div>
              }
              <div class="msg-bubble" [class.mine]="isMine(m)">
                @if(!isMine(m)){
                  <div class="msg-name">{{ m.senderName }}</div>
                }
                <div class="msg-text">{{ m.content }}</div>
                <div class="msg-time">
                  {{ m.sentAt | date:'shortTime' }}
                  @if(isMine(m)){ <mat-icon class="tick-icon">{{ m.isRead ? 'done_all' : 'done' }}</mat-icon> }
                </div>
              </div>
            </div>
          }
        }
        <div #msgEnd></div>
      </div>

      <!-- Input -->
      <div class="chat-input-bar">
        <input
          class="chat-input"
          [(ngModel)]="newMsg"
          placeholder="Type a message..."
          (keyup.enter)="send()"
          autocomplete="off"
        />
        <button class="send-btn" (click)="send()" [disabled]="!newMsg.trim() || sending">
          @if(sending){
            <mat-spinner diameter="18" style="margin:auto"></mat-spinner>
          } @else {
            <mat-icon>send</mat-icon>
          }
        </button>
      </div>

    </div>
  </div>
</div>`,
  styles: [`
    .chat-page {
      padding-top: 68px;
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }
    /* Header */
    .chat-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 0;
      position: sticky;
      top: 68px;
      z-index: 100;
    }
    .chat-header-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px; height: 36px;
      border-radius: 50%;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background 0.2s;
      flex-shrink: 0;
      &:hover { background: var(--surface2); }
      mat-icon { font-size: 20px; }
    }
    .chat-info { flex: 1; min-width: 0; }
    .chat-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chat-sub { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
    .chat-live { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .live-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #27ae60;
      animation: livePulse 2s ease-in-out infinite;
    }
    .live-label { font-size: 12px; color: #27ae60; font-weight: 600; }
    @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    /* Body layout */
    .chat-body {
      flex: 1;
      padding: 24px 0 32px;
    }
    .chat-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 240px);
      min-height: 420px;
    }

    /* Messages */
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--bg);
      scroll-behavior: smooth;
    }
    .chat-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 120px;
    }
    .chat-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 200px;
      text-align: center;
      color: var(--text-muted);
    }
    .chat-empty-icon { font-size: 44px; display: block; margin-bottom: 12px; }
    .chat-empty h3 { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--text-primary); margin-bottom: 6px; }
    .chat-empty p { font-size: 13px; }

    /* Message rows */
    .msg-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      &.mine { flex-direction: row-reverse; }
    }
    .msg-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: var(--teal);
      color: #0a2020;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }
    .msg-bubble {
      max-width: 65%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 16px 16px 16px 4px;
      padding: 10px 14px;

      &.mine {
        background: var(--teal);
        border: none;
        border-radius: 16px 16px 4px 16px;
        .msg-name { color: rgba(255,255,255,0.7); }
        .msg-text { color: #fff; }
        .msg-time { color: rgba(255,255,255,0.6); }
        .tick-icon { color: rgba(255,255,255,0.8); }
      }
    }
    [data-theme="dark"] .msg-bubble.mine .msg-text { color: #0a2020; }
    [data-theme="dark"] .msg-bubble.mine .msg-time { color: rgba(10,32,32,0.65); }

    .msg-name { font-size: 11px; font-weight: 600; color: var(--teal); margin-bottom: 4px; }
    .msg-text { font-size: 14px; color: var(--text-primary); line-height: 1.55; margin: 0; word-break: break-word; }
    .msg-time {
      display: flex; align-items: center; gap: 3px; justify-content: flex-end;
      font-size: 10.5px; color: var(--text-muted); margin-top: 5px;
    }
    .tick-icon { font-size: 13px !important; color: var(--text-muted); }

    /* Input bar */
    .chat-input-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: var(--surface);
      border-top: 1px solid var(--border);
    }
    .chat-input {
      flex: 1;
      height: 44px;
      padding: 0 16px;
      border: 1.5px solid var(--border);
      border-radius: 22px;
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 0.2s;
      &:focus { border-color: var(--teal3); }
      &::placeholder { color: var(--text-muted); }
    }
    .send-btn {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--teal);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.15s;
      &:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
      mat-icon { font-size: 20px; }
    }
    [data-theme="dark"] .send-btn { color: #0a2020; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgEnd') msgEnd!: ElementRef;
  messages = signal<any[]>([]);
  booking = signal<any>(null);
  loading = signal(true);
  newMsg = '';
  bookingId = 0;
  sending = false;
  private shouldScroll = false;
  private pollInterval: any;

  constructor(
    private msgService: MessageService,
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.bookingId = +p['bookingId'];
      this.bookingService.getById(this.bookingId).subscribe({
        next: (r: any) => this.booking.set(r.data),
        error: () => {}
      });
      this.loadMessages();
      this.pollInterval = setInterval(() => this.loadMessages(), 5000);
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.msgEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  loadMessages() {
    this.msgService.getByBooking(this.bookingId).subscribe({
      next: (r: any) => {
        this.messages.set(r.data || []);
        this.loading.set(false);
        this.shouldScroll = true;
      },
      error: () => this.loading.set(false)
    });
  }

  isMine(m: any) { return m.senderId === this.auth.userId; }

  send() {
    if (!this.newMsg.trim() || this.sending) return;
    const content = this.newMsg.trim();
    this.newMsg = '';
    this.sending = true;
    this.msgService.send({ bookingId: this.bookingId, content }).subscribe({
      next: () => { this.sending = false; this.loadMessages(); },
      error: (e: any) => {
        this.sending = false;
        this.newMsg = content;
        this.toast.error(e.error?.message || 'Failed to send message');
      }
    });
  }
}

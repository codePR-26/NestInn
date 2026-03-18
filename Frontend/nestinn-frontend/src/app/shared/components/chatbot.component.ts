import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface Message {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <button class="chat-fab" (click)="toggle()">
      {{ open ? '✕' : '💬' }}
    </button>

    <!-- Chat Window -->
    @if(open) {
      <div class="chat-window">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🏠</div>
            <div>
              <div class="chat-name">NestInn Assistant</div>
              <div class="chat-status">Always here to help</div>
            </div>
          </div>
          <button class="chat-close" (click)="toggle()">✕</button>
        </div>

        <div class="chat-messages" #msgContainer>
          @for(msg of messages(); track $index) {
            <div class="msg" [class.msg-user]="msg.role === 'user'" [class.msg-bot]="msg.role === 'bot'">
              @if(msg.role === 'bot') {
                <div class="msg-avatar">🏠</div>
              }
              <div class="msg-bubble">{{ msg.text }}</div>
            </div>
          }
          @if(loading()) {
            <div class="msg msg-bot">
              <div class="msg-avatar">🏠</div>
              <div class="msg-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          }
        </div>

        <div class="chat-input-area">
          <input
            type="text"
            [(ngModel)]="input"
            placeholder="Ask me anything..."
            (keydown.enter)="send()"
            [disabled]="loading()"
          />
          <button (click)="send()" [disabled]="loading() || !input.trim()">➤</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .chat-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--teal-700);
      color: white;
      font-size: 1.4rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(13,79,79,0.4);
      z-index: 9999;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chat-fab:hover { background: var(--teal-600); transform: scale(1.08); }

    .chat-window {
      position: fixed;
      bottom: 96px;
      right: 28px;
      width: 360px;
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(13,79,79,0.2);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: popUp 0.2s ease;
    }
    @keyframes popUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .chat-header {
      background: linear-gradient(135deg, var(--teal-900), var(--teal-700));
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chat-header-info { display: flex; align-items: center; gap: 10px; }
    .chat-avatar { font-size: 1.5rem; }
    .chat-name { color: white; font-weight: 700; font-size: 0.95rem; }
    .chat-status { color: rgba(255,255,255,0.6); font-size: 0.75rem; }
    .chat-close { background: none; border: none; color: white; font-size: 1rem; cursor: pointer; opacity: 0.7; }
    .chat-close:hover { opacity: 1; }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .msg { display: flex; align-items: flex-end; gap: 8px; }
    .msg-user { flex-direction: row-reverse; }
    .msg-avatar { font-size: 1.2rem; flex-shrink: 0; }
    .msg-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .msg-bot .msg-bubble { background: #f0f7f7; color: #1a2e2e; border-bottom-left-radius: 4px; }
    .msg-user .msg-bubble { background: var(--teal-700); color: white; border-bottom-right-radius: 4px; }

    .typing { display: flex; gap: 4px; align-items: center; padding: 12px 16px; }
    .typing span {
      width: 7px; height: 7px; background: var(--teal-400);
      border-radius: 50%; animation: bounce 1s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }

    .chat-input-area {
      padding: 12px;
      border-top: 1px solid #f0f4f4;
      display: flex;
      gap: 8px;
    }
    .chat-input-area input {
      flex: 1;
      padding: 10px 14px;
      border: 2px solid #e2eaea;
      border-radius: 24px;
      font-size: 0.875rem;
      outline: none;
      font-family: inherit;
    }
    .chat-input-area input:focus { border-color: var(--teal-300); }
    .chat-input-area button {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--teal-700);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .chat-input-area button:hover:not(:disabled) { background: var(--teal-600); }
    .chat-input-area button:disabled { opacity: 0.4; cursor: not-allowed; }

    @media(max-width: 480px) {
      .chat-window { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
      .chat-fab { right: 16px; bottom: 16px; }
    }
  `]
})
export class ChatbotComponent {
private readonly API_KEY = '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';
private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  open = false;
  input = '';
  loading = signal(false);
  messages = signal<Message[]>([
    { role: 'bot', text: 'Hi! 👋 I\'m the NestInn Assistant. Ask me anything about properties, bookings, or how NestInn works!' }
  ]);

  

  toggle() { this.open = !this.open; }

  send() {
    const text = this.input.trim();
    if (!text || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', text }]);
    this.input = '';
    this.loading.set(true);

    const systemContext = `You are a helpful assistant for NestInn, a property rental platform in India. 
    NestInn allows users to book properties like apartments, villas, cottages, resorts and more across India.
    Users can be Renters (who book properties) or Owners (who list properties).
    Keep answers short, friendly and helpful. Only answer questions related to NestInn or property rentals.
    If asked something unrelated, politely redirect to NestInn topics.`;

    const body = {
      contents: [{
        parts: [{
          text: `${systemContext}\n\nUser: ${text}`
        }]
      }]
    };

  fetch(this.API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.API_KEY}`
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    messages: [
      { 
        role: 'system', 
        content: 'You are a helpful assistant for NestInn, a property rental platform in India. NestInn allows users to book properties like apartments, villas, cottages, resorts and more across India. Users can be Renters who book properties or Owners who list properties. Keep answers short, friendly and helpful. Only answer questions related to NestInn or property rentals. If asked something unrelated, politely redirect to NestInn topics.'
      },
      { role: 'user', content: text }
    ]
  })
})
.then(res => res.json())
.then(res => {
  const reply = res?.choices?.[0]?.message?.content || 'Sorry, I could not understand that.';
  this.messages.update(m => [...m, { role: 'bot', text: reply }]);
  this.loading.set(false);
})
.catch(() => {
  this.messages.update(m => [...m, { role: 'bot', text: 'Sorry, something went wrong. Please try again!' }]);
  this.loading.set(false);
});
  }
}
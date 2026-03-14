export interface Message {
  messageId: number; bookingId: number; senderId: number; receiverId: number;
  senderName?: string; content: string; sentAt: string; isRead: boolean;
}
export interface SendMessageRequest { bookingId: number; content: string; }

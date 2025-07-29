import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chatservice.service';
import { v4 as uuidv4 } from 'uuid';
import { Database, ref, set } from '@angular/fire/database';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnChanges {
  @Input() cardId!: string;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  chats: Chat[] = [];
  messageText = '';
  loading = true;
  currentUser: User | null = null;
  selectedMessage?: Chat;
  isEditing = false;

  private auth = inject(Auth);
  private db = inject(Database);
  private sanitizer = inject(DomSanitizer);
  private userColorMap = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    if (this.cardId) {
      this.loadChats();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardId'] && this.cardId) {
      this.loadChats();
    }
  }

  private async loadChats(): Promise<void> {
    this.loading = true;
    try {
      const chats = await this.chatService.getChatsForCard(this.cardId);
      this.chats = chats.reverse();
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async sendMessage(): Promise<void> {
    const trimmed = this.messageText.trim();
    if (!trimmed || !this.cardId || !this.auth.currentUser) return;

    const newChat: Chat = {
      id: uuidv4(),
      author: this.auth.currentUser.email ?? 'Unknown',
      message: trimmed,
      createdAt: Date.now(),
    };

    try {
      await this.chatService.addChat(this.cardId, newChat);
      this.chats.push(newChat);
      this.chats = [...this.chats].reverse();
      this.messageText = '';
      this.chatInput?.nativeElement.focus();

      // Mark card as viewed
      const user = this.auth.currentUser;
      if (user) {
        const viewedRef = ref(
          this.db,
          `cards/${this.cardId}/lastViewedBy/${user.uid}`
        );
        await set(viewedRef, Date.now());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  onMessageDoubleClick(message: Chat): void {
    this.selectedMessage = message;
    this.isEditing = this.isOwnMessage(message);
  }

  isOwnMessage(msg: Chat): boolean {
    return msg.author === this.currentUser?.email;
  }

  async saveEditedMessage(): Promise<void> {
    if (!this.selectedMessage || !this.cardId) return;
    try {
      await this.chatService.updateChat(this.cardId, this.selectedMessage);
      this.selectedMessage = undefined;
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  }

  async deleteMessage(): Promise<void> {
    if (!this.selectedMessage || !this.cardId) return;
    const confirmed = confirm('Delete this message?');
    if (!confirmed) return;

    try {
      await this.chatService.deleteChat(this.cardId, this.selectedMessage.id!);
      this.chats = this.chats.filter((c) => c.id !== this.selectedMessage?.id);
      this.selectedMessage = undefined;
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  cancelEdit(): void {
    this.selectedMessage = undefined;
  }

  onAddImage(): void {
    alert('Image upload coming soon!');
  }

  getUserColor(email: string | undefined | null): string {
    if (!email) return '#eee';
    if (!this.userColorMap.has(email)) {
      const hash = [...email].reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      );
      const hue = hash % 360;
      const color = `hsl(${hue}, 70%, 85%)`;
      this.userColorMap.set(email, color);
    }
    return this.userColorMap.get(email)!;
  }

  convertLinks(text: string): SafeHtml {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linked = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(linked);
  }
}

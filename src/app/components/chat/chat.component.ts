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
  messageText: string = '';
  loading = true;
  currentUser: User | null = null;

  private auth = inject(Auth);
  private db = inject(Database);

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

      // ✅ Mark the card as viewed by this user (fix for self-red-dot)
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
}

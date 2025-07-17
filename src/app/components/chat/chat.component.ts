import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chatservice.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() cardId!: string;
  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;

  chats: Chat[] = [];
  messageText: string = '';
  loading = true;
  currentUser: User | null = null;

  private auth = inject(Auth);

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

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardId'] && this.cardId) {
      this.loadChats();
    }
  }

  private async loadChats(): Promise<void> {
    this.loading = true;
    try {
      this.chats = await this.chatService.getChatsForCard(this.cardId);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
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

    await this.chatService.addChat(this.cardId, newChat);
    this.messageText = '';
    await this.loadChats();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.bottomAnchor) {
        this.bottomAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}

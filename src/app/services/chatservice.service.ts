
import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  push,
  get,
  set,
  query,
  orderByChild,
  equalTo,
} from '@angular/fire/database';
import { Chat } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private db: Database) {}

  async getChatsForCard(cardId: string): Promise<Chat[]> {
    const chatsRef = ref(this.db, 'chats');
    const snapshot = await get(
      query(chatsRef, orderByChild('cardId'), equalTo(cardId))
    );

    const chats: Chat[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        chats.push({ id: key, ...data[key] });
      }
    }
    return chats.sort((a, b) => a.createdAt - b.createdAt);
  }

  async addChat(cardId: string, message: Chat): Promise<void> {
    const chatsRef = ref(this.db, 'chats');
    const newChatRef = push(chatsRef);
    const firebaseId = newChatRef.key;

    const timestamp = message.createdAt ?? Date.now();

    // 1. Save the message
    await set(newChatRef, {
      ...message,
      id: firebaseId,
      cardId,
      createdAt: timestamp,
    });

    // 2. Update lastMessageAt in the card
    const cardRef = ref(this.db, `cards/${cardId}/lastMessageAt`);
    await set(cardRef, timestamp);
  }
}

import { Chat } from './chat.model';

export interface Card {
  id?: string;
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  createdAt: number;
  position?: number;
  updatedAt?: number;
  imageUrls?: string[];
  done?: boolean;

  chat?: Chat[];

  lastMessageAt?: number;
  lastViewedBy?: { [userId: string]: number };
}

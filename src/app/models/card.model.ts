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
  imageUrl?: string;
  chat?: Chat[];
}

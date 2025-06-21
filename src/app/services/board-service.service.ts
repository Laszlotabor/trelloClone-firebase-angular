import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  push,
  set,
  update,
  remove,
  child,
  get,
} from '@angular/fire/database';
import { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardServiceService {
  private db: Database = inject(Database);

  // ✅ Create a new board
  async createBoard(board: Board): Promise<void> {
    const boardRef = push(ref(this.db, 'boards'));
    await set(boardRef, {
      ...board,
      createdAt: Date.now(),
    });
  }

  // ✅ Get all boards for a user (owner only)
  async getBoardsByUser(userId: string): Promise<Board[]> {
    const snapshot = await get(ref(this.db, 'boards'));
    const boards: Board[] = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        if (data[key].owner === userId) {
          boards.push({ id: key, ...data[key] });
        }
      }
    }

    return boards;
  }

  // ✅ Get all boards (for access filtering in component)
  async getAllBoards(): Promise<Board[]> {
    const snapshot = await get(ref(this.db, 'boards'));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data).map(([id, board]) => ({
      id,
      ...(board as Board),
    }));
  }

  // ✅ Update board
  updateBoard(id: string, data: Partial<Board>): Promise<void> {
    return update(ref(this.db, `boards/${id}`), data);
  }

  // ✅ Delete board
  deleteBoard(id: string): Promise<void> {
    return remove(ref(this.db, `boards/${id}`));
  }

  // ✅ Get one board by ID
  async getBoardById(id: string): Promise<Board | null> {
    const snapshot = await get(ref(this.db, `boards/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  }
}

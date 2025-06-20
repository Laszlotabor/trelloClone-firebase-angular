import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, get } from '@angular/fire/database';
import { List } from '../models/list.model';

@Injectable({
  providedIn: 'root',
})
export class ListServiceService {
  private db: Database = inject(Database);

  async createList(list: List): Promise<void> {
    const listRef = push(ref(this.db, 'lists'));
    await set(listRef, {
      ...list,
      createdAt: Date.now(),
    });
  }

  async getListsByBoard(boardId: string): Promise<List[]> {
    const snapshot = await get(ref(this.db, 'lists'));
    const result: List[] = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        if (data[key].boardId === boardId) {
          result.push({ id: key, ...data[key] });
        }
      }
    }

    return result;
  }

  // Optional: add updateList, deleteList etc. later
}

import { Injectable } from '@angular/core';
import { Database, ref, push, set, get, child } from '@angular/fire/database';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardserviceService {
  constructor(private db: Database) {}

  async createCard(card: Card): Promise<void> {
    const cardsRef = ref(this.db, `cards/${card.listId}`);
    const newCardRef = push(cardsRef);
    await set(newCardRef, { ...card, id: newCardRef.key });
  }

  async getCardsByList(listId: string): Promise<Card[]> {
    const snapshot = await get(child(ref(this.db), `cards/${listId}`));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data) as Card[];
  }
}

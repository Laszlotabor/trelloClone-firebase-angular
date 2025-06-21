import { Injectable } from '@angular/core';
import { Database, ref, push, set, get, child } from '@angular/fire/database';
import { Card } from '../models/card.model';
import { update, remove } from '@angular/fire/database';


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

  async updateCard(card: Card): Promise<void> {
    if (!card.id || !card.listId) throw new Error('Missing card ID or list ID');
    const cardRef = ref(this.db, `cards/${card.listId}/${card.id}`);
    await update(cardRef, {
      title: card.title,
      description: card.description,
      position: card.position ?? Date.now(),
      updatedAt: Date.now(),
    });
  }

  async deleteCard(card: Card): Promise<void> {
    if (!card.id || !card.listId) throw new Error('Missing card ID or list ID');
    const cardRef = ref(this.db, `cards/${card.listId}/${card.id}`);
    await remove(cardRef);
  }
}

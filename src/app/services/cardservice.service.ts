import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  push,
  set,
  get,
  update,
  remove,
} from '@angular/fire/database';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardserviceService {
  constructor(private db: Database) {}

  async createCard(card: Card): Promise<void> {
    const cardsRef = ref(this.db, 'cards');
    const newCardRef = push(cardsRef);
    const cardData: Card = {
      ...card,
      id: newCardRef.key!,
    };
    await set(newCardRef, cardData);
  }

  async getCardsByList(listId: string): Promise<Card[]> {
    const snapshot = await get(ref(this.db, 'cards'));
    const result: Card[] = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        const card = data[key];
        if (card.listId === listId) {
          result.push({ id: key, ...card });
        }
      }
    }

    return result;
  }

  async updateCard(card: Card): Promise<void> {
    if (!card.id) throw new Error('Missing card ID');
    const cardRef = ref(this.db, `cards/${card.id}`);
    await update(cardRef, {
      title: card.title,
      description: card.description,
      position: card.position ?? Date.now(),
      updatedAt: Date.now(),
      imageUrl: card.imageUrl ?? null,
    });
  }

  async deleteCard(card: Card): Promise<void> {
    if (!card.id) throw new Error('Missing card ID');
    const cardRef = ref(this.db, `cards/${card.id}`);
    await remove(cardRef);
  }

  async updateCardListChange(card: Card, newListId: string): Promise<void> {
    if (!card.id) throw new Error('Missing card ID');

    const cardRef = ref(this.db, `cards/${card.id}`);
    const updatedCard: Card = {
      ...card,
      listId: newListId,
      position: Date.now(),
      updatedAt: Date.now(),
      
    };

    await update(cardRef, updatedCard);
  }
}

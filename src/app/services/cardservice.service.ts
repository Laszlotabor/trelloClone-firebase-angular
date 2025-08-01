import { Injectable, inject } from '@angular/core';
import { Database } from '@angular/fire/database'; // ✅ import the token!
import { ref, push, set, get, update, remove } from '@angular/fire/database';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardserviceService {
  private db = inject(Database); // ✅ works now because Database is imported as a token

  async createCard(card: Card): Promise<void> {
    const cardsRef = ref(this.db, 'cards');
    const newCardRef = push(cardsRef);
    const cardData: Card = {
      ...card,
      id: newCardRef.key!,
      imageUrls: card.imageUrls ?? [],
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
      imageUrls: card.imageUrls ?? [],
      done: card.done ?? false,
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

  async getCardById(cardId: string): Promise<Card | undefined> {
    const cardRef = ref(this.db, `cards/${cardId}`);
    const snapshot = await get(cardRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return { id: cardId, ...data };
    }

    return undefined;
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { List } from '../../models/list.model';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input() list!: List;

  cards: Card[] = [];

  newCardTitle = '';
  newCardDescription = '';
  showAddCardForm = false; // 👈 add toggle state

  constructor(private cardService: CardserviceService) {}

  ngOnInit(): void {
    this.loadCards();
  }

  async loadCards(): Promise<void> {
    this.cards = await this.cardService.getCardsByList(this.list.id!);
  }

  toggleAddCardForm(): void {
    this.showAddCardForm = !this.showAddCardForm;
    if (!this.showAddCardForm) {
      this.newCardTitle = '';
      this.newCardDescription = '';
    }
  }

  async createCard(): Promise<void> {
    if (!this.newCardTitle.trim()) return;

    const newCard: Card = {
      title: this.newCardTitle.trim(),
      description: this.newCardDescription.trim(),
      listId: this.list.id!,
      boardId: this.list.boardId,
      createdAt: Date.now(),
      position: Date.now(),
    };

    await this.cardService.createCard(newCard);
    this.newCardTitle = '';
    this.newCardDescription = '';
    this.showAddCardForm = false;
    await this.loadCards();
  }
}

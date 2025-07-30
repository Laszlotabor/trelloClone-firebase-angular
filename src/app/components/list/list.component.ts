import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { List } from '../../models/list.model';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, DragDropModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input() list!: List;
  @Input() cards: Card[] = [];
  @Input() connectedDropLists: string[] = [];

  @Input() isMobile: boolean = false;

  @Output() deleteList = new EventEmitter<string>();
  @Output() cardDropped = new EventEmitter<{
    event: CdkDragDrop<Card[]>;
    listId: string;
  }>();

  newCardTitle = '';
  newCardDescription = '';
  showAddCardForm = false;

  constructor(private cardService: CardserviceService) {}

  ngOnInit(): void {}

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

    // Reload cards to get Firebase ID
    this.cards = await this.cardService.getCardsByList(this.list.id!);
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    if (!this.isMobile) {
      this.cardDropped.emit({ event, listId: this.list.id! });
    }
  }

  onDeleteList(): void {
    const confirmed = confirm(`Delete list "${this.list.title}"?`);
    if (confirmed) {
      this.deleteList.emit(this.list.id!);
    }
  }
}

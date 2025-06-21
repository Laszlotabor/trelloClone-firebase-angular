import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() card!: Card;

  isEditing = false;
  editableTitle = '';
  editableDescription = '';

  @Output() cardChanged = new EventEmitter<void>(); // 👈 Add this at the top

  constructor(private cardService: CardserviceService) {}

  startEditing(): void {
    this.editableTitle = this.card.title;
    this.editableDescription = this.card.description || '';
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  async saveEdit(): Promise<void> {
    const updatedCard: Card = {
      ...this.card,
      title: this.editableTitle.trim(),
      description: this.editableDescription.trim(),
    };

    await this.cardService.updateCard(updatedCard);
    this.card = updatedCard;
    this.isEditing = false;
  }

  async deleteCard(): Promise<void> {
    if (confirm('Are you sure you want to delete this card?')) {
      await this.cardService.deleteCard(this.card);
      this.cardChanged.emit(); // 👈 Tell parent to refresh
    }
  }
}

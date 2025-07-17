import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ChatComponent } from '../chat/chat.component';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cardService = inject(CardserviceService);
  private storage = inject(Storage);

  cardId!: string;
  card?: Card;
  loading = true;

  isEditing = false;
  editableTitle = '';
  editableDescription = '';

  constructor() {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.cardId = id;
        this.card = await this.cardService.getCardById(id);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    if (this.card?.boardId) {
      this.router.navigate(['/board', this.card.boardId]);
    } else {
      this.router.navigate(['/boards']);
    }
  }

  startEditing(): void {
    if (!this.card) return;
    this.editableTitle = this.card.title;
    this.editableDescription = this.card.description || '';
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  async saveEdit(): Promise<void> {
    if (!this.card) return;

    const updatedCard: Card = {
      ...this.card,
      title: this.editableTitle.trim(),
      description: this.editableDescription.trim(),
      updatedAt: Date.now(),
    };

    await this.cardService.updateCard(updatedCard);
    this.card = updatedCard;
    this.isEditing = false;
  }

  async deleteCard(): Promise<void> {
    if (!this.card) return;

    const confirmed = confirm('Are you sure you want to delete this card?');
    if (confirmed) {
      await this.cardService.deleteCard(this.card);
      this.router.navigate(['/board', this.card.boardId]);
    }
  }

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.card?.id) return;

    const fileRef = ref(this.storage, `card-images/${this.card.id}/${file.name}`);

    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      this.card.imageUrl = downloadURL;
      await this.cardService.updateCard(this.card);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';
// ✅ Correct
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';


@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() card!: Card;
  @Output() openDetail = new EventEmitter<void>();

  isEditing = false;
  editableTitle = '';
  editableDescription = '';

 

  @Output() cardChanged = new EventEmitter<void>(); // 👈 Add this at the top
  @Output() cardDeleted = new EventEmitter<string>();

  constructor(
    private cardService: CardserviceService,
    private storage: Storage // ✅ AngularFire Storage instance
  ) {}

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.card.id) return;

    const fileRef = ref(
      this.storage,
      `card-images/${this.card.id}/${file.name}`
    );

    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      this.card.imageUrl = downloadURL;
      await this.cardService.updateCard(this.card);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }

  startEditing(): void {
    this.editableTitle = this.card.title;
    this.editableDescription = this.card.description || '';
    this.isEditing = true;
  }

  removeImage() {
    const confirmDelete = confirm(
      'Are you sure you want to remove this image?'
    );
    if (confirmDelete) {
      this.card.imageUrl = '';
      // Optionally sync with backend here
    }
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
      this.cardDeleted.emit(this.card.id!); // 👈 Emit the deleted card ID
    }
  }

  onCardClicked(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isButton = target.closest('button') || target.tagName === 'BUTTON';
    if (!isButton) {
      this.openDetail.emit();
    }
  }
}

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/card.model';
import { CardserviceService } from '../../services/cardservice.service';
import {
  Storage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { Database, ref as dbRef, set } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { ChatComponent } from '../chat/chat.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cardService = inject(CardserviceService);
  private storage = inject(Storage);
  private db = inject(Database);
  private auth = inject(Auth);

  cardId!: string;
  card?: Card;
  loading = true;

  isEditing = false;
  editableTitle = '';
  editableDescription = '';

  // 🔥 Mobile Chat Modal Support
  chatModalOpen = false;
  isMobileView = false;

  constructor() {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.cardId = id;
        this.card = await this.cardService.getCardById(id);
        await this.markCardAsViewed(id); // ✅ Mark as viewed when loaded
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    this.updateViewMode();
    window.addEventListener('resize', this.updateViewModeBound);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateViewModeBound);
  }

  // Bound version for add/removeEventListener
  private updateViewModeBound = () => this.updateViewMode();

  private updateViewMode(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  toggleChatModal(): void {
    this.chatModalOpen = !this.chatModalOpen;
  }

  private async markCardAsViewed(cardId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const viewedRef = dbRef(
      this.db,
      `cards/${cardId}/lastViewedBy/${user.uid}`
    );
    await set(viewedRef, Date.now());
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
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.card?.id) return;

    const uploadPromises = [];

    for (const file of Array.from(files)) {
      const fileRef = storageRef(
        this.storage,
        `card-images/${this.card.id}/${file.name}-${uuidv4()}`
      );

      const uploadTask = uploadBytes(fileRef, file).then(async () => {
        const downloadURL = await getDownloadURL(fileRef);
        if (!this.card!.imageUrls) {
          this.card!.imageUrls = [];
        }
        this.card!.imageUrls.push(downloadURL);
      });

      uploadPromises.push(uploadTask);
    }

    try {
      await Promise.all(uploadPromises);
      await this.cardService.updateCard(this.card!);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.card || !this.card.imageUrls) return;

    const confirmed = confirm('Are you sure you want to delete this image?');
    if (!confirmed) return;

    this.card.imageUrls = this.card.imageUrls.filter((img) => img !== url);
    await this.cardService.updateCard(this.card);
  }
}

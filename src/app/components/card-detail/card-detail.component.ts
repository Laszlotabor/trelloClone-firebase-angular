import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.scss',
})
export class CardDetailComponent {
  @Input() card!: Card;
  @Output() close = new EventEmitter<void>();

  isImageModalOpen = false;

  openImageModal = (): void => {
    this.isImageModalOpen = true;
  };
  closeImageModal = (): void => {
    this.isImageModalOpen = false;
  };

  onClose = (): void => this.close.emit();

  onOverlayClick(): void {
    this.isImageModalOpen ? this.closeImageModal() : this.onClose();
  }
}

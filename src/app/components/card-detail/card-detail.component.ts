import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card.model'; // adjust path if needed
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

  onClose() {
    this.close.emit();
  }
}

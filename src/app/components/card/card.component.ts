import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() card!: Card;

  constructor(private router: Router) {}

  onCardClicked(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isButton = target.closest('button') || target.tagName === 'BUTTON';

    if (!isButton) {
      this.router.navigate(['/card', this.card.id]);
    }
  }
}

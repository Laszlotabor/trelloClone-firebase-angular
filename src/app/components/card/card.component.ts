import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() card!: Card;

  isUnread = false;

  private router = inject(Router);
  private auth = inject(Auth);

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !this.card) return;

    const lastMessageAt = this.card.lastMessageAt ?? 0;
    const lastViewed = this.card.lastViewedBy?.[user.uid] ?? 0;

    this.isUnread = lastMessageAt > lastViewed;
  }

  onCardClicked(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isButton = target.closest('button') || target.tagName === 'BUTTON';

    if (!isButton) {
      this.router.navigate(['/card', this.card.id]);
    }
  }
  get lastImageUrl(): string | null {
    return this.card.imageUrls?.length
      ? this.card.imageUrls[this.card.imageUrls.length - 1]
      : null;
  }
}

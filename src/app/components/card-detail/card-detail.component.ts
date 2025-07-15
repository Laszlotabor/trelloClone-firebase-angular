import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardserviceService } from '../../services/cardservice.service';
import { Card } from '../../models/card.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.scss',
})
export class CardDetailComponent {
  private route = inject(ActivatedRoute);
  private cardService = inject(CardserviceService);
  private router = inject(Router);

  cardId!: string;
  card?: Card;
  loading = true;

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
      this.router.navigate(['/boards']); // fallback if boardId is missing
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Board } from '../../models/board.model';
import { List } from '../../models/list.model';
import { Card } from '../../models/card.model';


import { BoardServiceService } from '../../services/board-service.service';
import { ListServiceService } from '../../services/list-service.service';
import { CardserviceService } from '../../services/cardservice.service';


import { ListComponent } from '../list/list.component';
import { ShareBoardComponent } from '../shareboard-component/shareboard-component.component';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListComponent,
    DragDropModule,
    ShareBoardComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  boardId!: string;
  board: Board | null = null;

  lists: List[] = [];
  cardsMap: { [listId: string]: Card[] } = {};

  userEmail: string = '';
  newListTitle: string = '';
  newListDescription: string = '';
  newAllowedEmail: string = '';

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardServiceService,
    private listService: ListServiceService,
    private cardService: CardserviceService,
    private router: Router,
    private authService: AuthServiceService
  ) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      this.userEmail = user?.email || 'Guest';
    });
  }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id')!;
    this.loadBoard();
    this.loadLists();
  }

  async loadBoard(): Promise<void> {
    this.board = await this.boardService.getBoardById(this.boardId);
  }

  async loadLists(): Promise<void> {
    this.lists = await this.listService.getListsByBoard(this.boardId);

    for (const list of this.lists) {
      const cards = await this.cardService.getCardsByList(list.id!);
      this.cardsMap[list.id!] = cards.sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
    }
  }

  async createList(): Promise<void> {
    if (!this.newListTitle.trim()) return;

    const newList: List = {
      title: this.newListTitle.trim(),
      description: this.newListDescription.trim(),
      boardId: this.boardId,
      createdAt: Date.now(),
      position: Date.now(),
    };

    await this.listService.createList(newList);
    this.newListTitle = '';
    this.newListDescription = '';
    this.loadLists();
  }

  goBack(): void {
    this.router.navigate(['/boards']);
  }

  async deleteBoard(): Promise<void> {
    if (!this.board || this.authService.currentUserId !== this.board.owner) {
      alert('Only the board owner can delete this board.');
      return;
    }

    const confirmed = confirm(`Delete board "${this.board.title}"?`);
    if (!confirmed) return;

    await this.boardService.deleteBoard(this.board.id!);
    this.router.navigate(['/boards']);
  }

  getDropListIds(): string[] {
    return this.lists.map((list) => 'cdk-drop-list-' + list.id);
  }

  async onCardDrop(
    event: CdkDragDrop<Card[]>,
    targetListId: string
  ): Promise<void> {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const movedCard = event.previousContainer.data[event.previousIndex];

      // 🛠 Clone BEFORE modifying
      const originalCard = { ...movedCard };

      // Update in-place for UI
      movedCard.listId = targetListId;
      movedCard.position = Date.now();

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // ✅ Pass the original copy with old listId
      await this.cardService.updateCardListChange(originalCard, targetListId);

      // 🧠 Optional: reload lists to force a fresh state (if needed)
      // await this.loadLists();
    }
  }

  async onDeleteList(listId: string): Promise<void> {
    // Remove from backend
    await this.listService.deleteList(listId);

    // Remove from local lists
    this.lists = this.lists.filter((list) => list.id !== listId);
    delete this.cardsMap[listId];
  }
  async addAllowedUser(): Promise<void> {
    const email = this.newAllowedEmail.trim();
    if (!email || !this.board) return;

    // Ensure allowedUsers is initialized
    if (!this.board.allowedUsers) {
      this.board.allowedUsers = [];
    }

    // Only add if not already present
    if (!this.board.allowedUsers.includes(email)) {
      this.board.allowedUsers.push(email);
      await this.boardService.updateBoard(this.board.id!, {
        allowedUsers: this.board.allowedUsers,
      });
      this.newAllowedEmail = '';
    }
  }
}

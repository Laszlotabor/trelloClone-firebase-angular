import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Board } from '../../models/board.model';
import { BoardServiceService } from '../../services/board-service.service';
import { AuthServiceService } from '../../services/auth-service.service';

declare var bootstrap: any; // For Bootstrap modal control

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent implements OnInit {
  title: string = '';
  description: string = '';
  boards: Board[] = [];
  uid: string | null = null;
  userEmail: string = 'Guest';

  constructor(
    private boardService: BoardServiceService,
    private authService: AuthServiceService
  ) {}

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        this.uid = user.uid;
        this.userEmail = user.email || 'Guest';
        this.loadBoards();
      }
    });
  }

  async createBoard(): Promise<void> {
    if (!this.uid || !this.title.trim()) return;

    const newBoard: Board = {
      title: this.title.trim(),
      description: this.description.trim(),
      owner: this.uid,
      allowedUsers: [],
      createdAt: Date.now(),
    };

    await this.boardService.createBoard(newBoard);

    // Clear form
    this.title = '';
    this.description = '';

    // Close modal
    const modalEl = document.getElementById('createBoardModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }

    // Reload boards
    this.loadBoards();
  }

  async loadBoards(): Promise<void> {
    const allBoards = await this.boardService.getAllBoards();
    this.boards = allBoards.filter(
      (board) =>
        board.owner === this.uid ||
        (board.allowedUsers?.includes(this.userEmail) ?? false)
    );
  }

  async deleteBoard(board: Board, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const confirmed = confirm(`Delete board "${board.title}"?`);
    if (!confirmed) return;

    await this.boardService.deleteBoard(board.id!);
    this.loadBoards();
  }
}

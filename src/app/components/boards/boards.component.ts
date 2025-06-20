import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models/board.model';
import { BoardServiceService } from '../../services/board-service.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink
],
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent {
  title: string = '';
  description: string = '';
  boards: Board[] = [];
  uid: string | null = null;

  constructor(
    private boardService: BoardServiceService,
    private authService: AuthServiceService
  ) {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
        this.loadBoards();
      }
    });
  }

  async createBoard() {
    if (!this.uid || !this.title.trim()) return;

    const newBoard: Board = {
      title: this.title.trim(),
      description: this.description.trim(),
      owner: this.uid,
      allowedUsers: [],
      createdAt: Date.now(),
    };

    await this.boardService.createBoard(newBoard);
    this.title = '';
    this.description = '';
    this.loadBoards();
  }

  async loadBoards() {
    if (!this.uid) return;
    this.boards = await this.boardService.getBoardsByUser(this.uid);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models/board.model';
import { BoardServiceService } from '../../services/board-service.service';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-share-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shareboard-component.component.html',
  styleUrl: './shareboard-component.component.scss',
})
export class ShareBoardComponent {
  @Input() board!: Board;
  newAllowedEmail = '';

  constructor(
    public boardService: BoardServiceService,
    public authService: AuthServiceService
  ) {}

  async addAllowedUser(): Promise<void> {
    const email = this.newAllowedEmail.trim().toLowerCase();
    if (!email) return;

    this.board.allowedUsers ??= [];

    if (this.board.allowedUsers.includes(email)) return;

    const isValid = await this.authService.isRegisteredUser(email);
    if (!isValid) {
      alert(`No registered user with email: ${email}`);
      return;
    }

    const updatedUsers = [...this.board.allowedUsers, email];
    await this.boardService.updateBoard(this.board.id!, {
      allowedUsers: updatedUsers,
    });
    this.board.allowedUsers = updatedUsers;
    this.newAllowedEmail = '';
  }

  async removeAllowedUser(email: string): Promise<void> {
    if (this.authService.currentUserId !== this.board.owner) {
      alert('Only the board owner can remove users.');
      return;
    }

    const updatedUsers = this.board.allowedUsers.filter((u) => u !== email);
    await this.boardService.updateBoard(this.board.id!, {
      allowedUsers: updatedUsers,
    });

    this.board.allowedUsers = updatedUsers;
  }
}

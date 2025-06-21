import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';


import { Board } from '../../models/board.model';
import { List } from '../../models/list.model';


import { BoardServiceService } from '../../services/board-service.service';
import { ListServiceService } from '../../services/list-service.service';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, ListComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  boardId!: string;
  board: Board | null = null;

  lists: List[] = [];
  userEmail: string = '';

  newListTitle: string = '';
  newListDescription: string = '';

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardServiceService,
    private listService: ListServiceService,
    private router: Router
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
  }

  async createList(): Promise<void> {
    if (!this.newListTitle.trim()) return;

    const newList: List = {
      title: this.newListTitle.trim(),
      description: this.newListDescription.trim(),
      boardId: this.boardId,
      createdAt: Date.now(),
      position: Date.now(), // ✅ or use lists.length
    };

    await this.listService.createList(newList);
    this.newListTitle = '';
    this.newListDescription = '';
    this.loadLists();
  }

  goBack(): void {
    this.router.navigate(['/boards']); // 👈 Adjust path if needed
  }

  async deleteBoard(): Promise<void> {
    const confirmed = confirm(`Delete board "${this.board?.title}"?`);
    if (!confirmed || !this.board) return;

    await this.boardService.deleteBoard(this.board.id!);
    this.router.navigate(['/boards']);
  }
}

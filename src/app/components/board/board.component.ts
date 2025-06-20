import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Board } from '../../models/board.model';
import { List } from '../../models/list.model';

import { BoardServiceService } from '../../services/board-service.service';
import { ListServiceService } from '../../services/list-service.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  boardId!: string;
  board: Board | null = null;

  lists: List[] = [];

  newListTitle: string = '';
  newListDescription: string = '';

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardServiceService,
    private listService: ListServiceService
  ) {}

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
}

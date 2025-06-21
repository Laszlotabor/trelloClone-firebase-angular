import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { List } from '../../models/list.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  @Input() list!: List; // 👈 THIS is the key part
}

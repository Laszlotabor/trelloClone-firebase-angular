export interface List {
  id?: string;
  title: string;
  description?: string; // Optional field for extra list context
  boardId: string;
  position: number;
  createdAt: number;
}

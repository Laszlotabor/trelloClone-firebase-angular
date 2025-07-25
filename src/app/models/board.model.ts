export interface Board {
  id?: string;
  title: string;
  description?: string;
  owner: string;
  allowedUsers: string[];
  createdAt: number;
}

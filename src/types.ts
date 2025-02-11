// src/types.ts
export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  tags: string[];
  status: string;
  order: number; // Add this line
}
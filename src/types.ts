// src/types.ts
export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  tags: string[];
  order: number; // Add this line
}
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'completed';
export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'Other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category: Category;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export type FilterStatus = 'all' | Status;
export type FilterPriority = 'all' | Priority;
export type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'createdDesc' | 'titleAsc';

export interface TaskFilterOptions {
  status: FilterStatus;
  priority: FilterPriority;
  category: string; // 'all' or specific category
  search: string;
  sortBy: SortOption;
}

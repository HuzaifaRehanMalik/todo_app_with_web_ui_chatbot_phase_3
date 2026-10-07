export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string | null; // "YYYY-MM-DD" calendar day, or null when unscheduled
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TodoCreate {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null; // null clears the date; omit to leave it unchanged
}

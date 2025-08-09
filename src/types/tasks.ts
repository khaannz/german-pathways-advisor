export interface Task {
  id: string;
  user_id: string;
  assigned_by: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  assigned_by_profile?: {
    name: string;
    email: string;
  };
  user_profile?: {
    name: string;
    email: string;
  };
  comments?: TaskComment[];
  comments_count?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateTaskRequest {
  user_id: string;
  assigned_by: string;
  title: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface CreateTaskCommentRequest {
  task_id: string;
  comment: string;
  user_id: string;
}

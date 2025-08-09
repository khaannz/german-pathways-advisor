import { supabase } from '@/integrations/supabase/client';
import { CreateTaskRequest, UpdateTaskRequest, CreateTaskCommentRequest } from '../types/tasks';

class TaskService {
  // Task CRUD operations
  async createTask(request: CreateTaskRequest): Promise<any> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(request)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getTasks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTasksByUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTasksByAssignedBy(assignedBy: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_by', assignedBy)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTaskById(taskId: string): Promise<any> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId: string, request: UpdateTaskRequest): Promise<any> {
    const { data, error } = await supabase
      .from('tasks')
      .update(request)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  // Task Comments CRUD operations
  async createTaskComment(request: CreateTaskCommentRequest): Promise<any> {
    const { data, error } = await supabase
      .from('task_comments')
      .insert(request)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getTaskComments(taskId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateTaskComment(commentId: string, comment: string): Promise<any> {
    const { data, error } = await supabase
      .from('task_comments')
      .update({ comment })
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTaskComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  // Utility functions
  getTaskPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTaskStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatTaskStatus(status: string): string {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  isTaskOverdue(dueDate?: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}

export const taskService = new TaskService();

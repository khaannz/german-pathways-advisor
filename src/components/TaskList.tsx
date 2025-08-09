import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { taskService } from '../services/taskService';
import { TaskComments } from './TaskComments';

interface Task {
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
}

interface TaskListProps {
  userId: string;
  isEmployee: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ userId, isEmployee }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [userId, isEmployee]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let data;
      if (isEmployee) {
        // Employees see tasks for the selected user
        if (userId) {
          data = await taskService.getTasksByUser(userId);
        } else {
          data = [];
        }
      } else {
        // Students see only tasks assigned to them
        data = await taskService.getTasksByUser(userId);
      }
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await taskService.updateTask(taskId, { status });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowComments(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          {isEmployee ? 'No tasks assigned yet' : 'No tasks assigned to you yet'}
        </div>
        <p className="text-gray-400 text-sm">
          {isEmployee 
            ? 'Create tasks to help guide your students through their application process.'
            : 'Your advisor will assign tasks to help guide you through your application process.'
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTaskClick(task)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPriorityIcon(task.priority)}
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(task.created_at)}</span>
                  </div>
                  
                  {task.due_date && (
                    <div className={`flex items-center gap-1 ${isOverdue(task.due_date) ? 'text-red-500' : ''}`}>
                      <Clock className="w-4 h-4" />
                      <span>Due {formatDate(task.due_date)}</span>
                      {isOverdue(task.due_date) && <span className="font-medium">(Overdue)</span>}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                  </div>
                </div>
              </div>
              
              {!isEmployee && task.status !== 'completed' && (
                <div className="flex gap-2 ml-4">
                  {task.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, 'in_progress');
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, 'completed');
                      }}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Comments Modal */}
      {showComments && selectedTask && (
        <TaskComments
          task={selectedTask}
          currentUserId={userId}
          onClose={() => {
            setShowComments(false);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
};

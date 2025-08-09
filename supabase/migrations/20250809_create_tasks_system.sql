-- Create tasks table for employee-student task management
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
    description TEXT NOT NULL CHECK (char_length(trim(description)) >= 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_comments table for communication between employees and students
CREATE TABLE public.task_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL CHECK (char_length(trim(comment)) >= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);

-- Create trigger for automatic timestamp updates on tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on task_comments
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for tasks table

-- Users can view tasks assigned to them
CREATE POLICY "Users can view their assigned tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update status of their assigned tasks
CREATE POLICY "Users can update their task status" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Employees can view all tasks
CREATE POLICY "Employees can view all tasks" 
ON public.tasks 
FOR SELECT 
USING (public.is_employee(auth.uid()));

-- Employees can create tasks
CREATE POLICY "Employees can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (public.is_employee(auth.uid()));

-- Employees can update all tasks
CREATE POLICY "Employees can update all tasks" 
ON public.tasks 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Employees can delete tasks they created
CREATE POLICY "Employees can delete tasks they created" 
ON public.tasks 
FOR DELETE 
USING (public.is_employee(auth.uid()) AND auth.uid() = assigned_by);

-- RLS Policies for task_comments table

-- Users can view comments on their tasks
CREATE POLICY "Users can view comments on their tasks" 
ON public.task_comments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE tasks.id = task_comments.task_id 
        AND tasks.user_id = auth.uid()
    )
);

-- Users can add comments to their tasks
CREATE POLICY "Users can comment on their tasks" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE tasks.id = task_comments.task_id 
        AND tasks.user_id = auth.uid()
    )
    AND auth.uid() = task_comments.user_id
);

-- Employees can view all task comments
CREATE POLICY "Employees can view all task comments" 
ON public.task_comments 
FOR SELECT 
USING (public.is_employee(auth.uid()));

-- Employees can add comments to any task
CREATE POLICY "Employees can comment on any task" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (public.is_employee(auth.uid()) AND auth.uid() = task_comments.user_id);

-- Users and employees can update their own comments
CREATE POLICY "Users can update their own comments" 
ON public.task_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Employees can delete any comment, users can delete their own
CREATE POLICY "Users and employees can delete comments" 
ON public.task_comments 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Create table for CV work experience entries
CREATE TABLE public.cv_work_experience_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_response_id UUID NOT NULL,
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cv_work_experience_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Students can view their own work experience entries" 
ON public.cv_work_experience_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own work experience entries" 
ON public.cv_work_experience_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own work experience entries" 
ON public.cv_work_experience_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own work experience entries" 
ON public.cv_work_experience_entries 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all work experience entries" 
ON public.cv_work_experience_entries 
FOR SELECT 
USING (is_employee(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cv_work_experience_entries_updated_at
BEFORE UPDATE ON public.cv_work_experience_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
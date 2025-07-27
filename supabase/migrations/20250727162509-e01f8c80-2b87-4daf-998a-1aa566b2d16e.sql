-- Create cv_education_entries table for dynamic education history
CREATE TABLE public.cv_education_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_response_id UUID NOT NULL REFERENCES public.cv_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  institution TEXT NOT NULL,
  program TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cv_education_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for cv_education_entries
CREATE POLICY "Students can view their own education entries" 
ON public.cv_education_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own education entries" 
ON public.cv_education_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own education entries" 
ON public.cv_education_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own education entries" 
ON public.cv_education_entries 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all education entries" 
ON public.cv_education_entries 
FOR SELECT 
USING (is_employee(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cv_education_entries_updated_at
BEFORE UPDATE ON public.cv_education_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
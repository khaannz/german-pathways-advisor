-- Create enquiry_comments table for threaded conversations
CREATE TABLE public.enquiry_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enquiry_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for enquiry comments
CREATE POLICY "Users can view comments on their enquiries" 
ON public.enquiry_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.enquiries 
    WHERE enquiries.id = enquiry_comments.enquiry_id 
    AND enquiries.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can view all enquiry comments" 
ON public.enquiry_comments 
FOR SELECT 
USING (is_employee(auth.uid()));

CREATE POLICY "Users can comment on their enquiries" 
ON public.enquiry_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.enquiries 
    WHERE enquiries.id = enquiry_comments.enquiry_id 
    AND enquiries.user_id = auth.uid()
  ) AND auth.uid() = user_id
);

CREATE POLICY "Employees can comment on any enquiry" 
ON public.enquiry_comments 
FOR INSERT 
WITH CHECK (is_employee(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.enquiry_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and employees can delete comments" 
ON public.enquiry_comments 
FOR DELETE 
USING (
  (auth.uid() = user_id) OR 
  is_employee(auth.uid())
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enquiry_comments_updated_at
BEFORE UPDATE ON public.enquiry_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
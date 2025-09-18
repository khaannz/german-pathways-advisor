-- Create contact_messages table for anonymous contact submissions
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  user_id UUID REFERENCES auth.users,  -- Optional for authenticated users
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies for contact messages
CREATE POLICY "Anyone can create contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Employees can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (is_employee(auth.uid()));

CREATE POLICY "Users can view their own contact messages if logged in" 
ON public.contact_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create contact_message_comments table for employee responses
CREATE TABLE public.contact_message_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_message_comments ENABLE ROW LEVEL SECURITY;

-- Policies for contact message comments
CREATE POLICY "Employees can create comments on contact messages" 
ON public.contact_message_comments 
FOR INSERT 
WITH CHECK (is_employee(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Employees can view all contact message comments" 
ON public.contact_message_comments 
FOR SELECT 
USING (is_employee(auth.uid()));

CREATE POLICY "Employees and comment authors can update comments" 
ON public.contact_message_comments 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_employee(auth.uid()));

CREATE POLICY "Employees and comment authors can delete comments" 
ON public.contact_message_comments 
FOR DELETE 
USING ((auth.uid() = user_id) OR is_employee(auth.uid()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_contact_message_comments_updated_at
BEFORE UPDATE ON public.contact_message_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
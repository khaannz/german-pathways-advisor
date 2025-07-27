-- Create enquiries table
CREATE TABLE public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for enquiries
CREATE POLICY "Students can view their own enquiries" 
ON public.enquiries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own enquiries" 
ON public.enquiries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can view all enquiries" 
ON public.enquiries 
FOR SELECT 
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all enquiries" 
ON public.enquiries 
FOR UPDATE 
USING (is_employee(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
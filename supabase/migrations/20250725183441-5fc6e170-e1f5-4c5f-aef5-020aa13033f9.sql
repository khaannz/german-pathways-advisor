-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('not_applied', 'in_progress', 'applied');

-- Create shortlisted_universities table
CREATE TABLE public.shortlisted_universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  application_status public.application_status NOT NULL DEFAULT 'not_applied',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shortlisted_universities ENABLE ROW LEVEL SECURITY;

-- Create policies for shortlisted_universities
CREATE POLICY "Users can view their own shortlisted universities" 
ON public.shortlisted_universities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shortlisted universities" 
ON public.shortlisted_universities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shortlisted universities" 
ON public.shortlisted_universities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortlisted universities" 
ON public.shortlisted_universities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create SOPs table
CREATE TABLE public.sops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  google_docs_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- Create policies for SOPs
CREATE POLICY "Users can view their own SOPs" 
ON public.sops 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SOPs" 
ON public.sops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOPs" 
ON public.sops 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOPs" 
ON public.sops 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create LORs table
CREATE TABLE public.lors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  google_docs_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lors ENABLE ROW LEVEL SECURITY;

-- Create policies for LORs
CREATE POLICY "Users can view their own LORs" 
ON public.lors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LORs" 
ON public.lors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LORs" 
ON public.lors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LORs" 
ON public.lors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add update triggers for all tables
CREATE TRIGGER update_shortlisted_universities_updated_at
BEFORE UPDATE ON public.shortlisted_universities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sops_updated_at
BEFORE UPDATE ON public.sops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lors_updated_at
BEFORE UPDATE ON public.lors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
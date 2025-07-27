-- Create storage bucket for CV photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cv_photos', 'cv_photos', false);

-- Create storage policies for CV photos
CREATE POLICY "Users can view their own CV photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own CV photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own CV photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CV photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Employees can view all CV photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv_photos' AND is_employee(auth.uid()));

-- Create sop_responses table
CREATE TABLE public.sop_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  date_of_birth DATE,
  linked_in TEXT,
  current_education_status TEXT,
  intended_program TEXT,
  target_universities TEXT,
  why_this_program TEXT,
  why_germany TEXT,
  short_term_goals TEXT,
  long_term_goals TEXT,
  has_thesis BOOLEAN DEFAULT false,
  thesis_details TEXT,
  academic_projects TEXT,
  work_experience TEXT,
  personal_qualities TEXT,
  challenges_accomplishments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sop_responses
ALTER TABLE public.sop_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sop_responses
CREATE POLICY "Students can view their own SOP responses" 
ON public.sop_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own SOP responses" 
ON public.sop_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own SOP responses" 
ON public.sop_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all SOP responses" 
ON public.sop_responses 
FOR SELECT 
USING (is_employee(auth.uid()));

-- Create lor_responses table
CREATE TABLE public.lor_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommender_name TEXT,
  recommender_designation TEXT,
  recommender_institution TEXT,
  recommender_email TEXT,
  relationship_type TEXT,
  relationship_duration TEXT,
  courses_projects TEXT,
  key_strengths TEXT,
  specific_examples TEXT,
  grades_performance TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lor_responses
ALTER TABLE public.lor_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lor_responses
CREATE POLICY "Students can view their own LOR responses" 
ON public.lor_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own LOR responses" 
ON public.lor_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own LOR responses" 
ON public.lor_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all LOR responses" 
ON public.lor_responses 
FOR SELECT 
USING (is_employee(auth.uid()));

-- Create cv_responses table
CREATE TABLE public.cv_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  education_history TEXT,
  work_experience TEXT,
  technical_skills TEXT,
  soft_skills TEXT,
  languages TEXT,
  certifications TEXT,
  extracurriculars TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cv_responses
ALTER TABLE public.cv_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cv_responses
CREATE POLICY "Students can view their own CV responses" 
ON public.cv_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own CV responses" 
ON public.cv_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own CV responses" 
ON public.cv_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all CV responses" 
ON public.cv_responses 
FOR SELECT 
USING (is_employee(auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_sop_responses_updated_at
BEFORE UPDATE ON public.sop_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lor_responses_updated_at
BEFORE UPDATE ON public.lor_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cv_responses_updated_at
BEFORE UPDATE ON public.cv_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
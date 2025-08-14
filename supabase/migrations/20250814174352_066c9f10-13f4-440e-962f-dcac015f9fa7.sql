-- Create enum for service types
CREATE TYPE public.service_type AS ENUM (
  'sop',
  'lor', 
  'university_shortlisting',
  'cover_letter',
  'visa_motivation'
);

-- Create user_services table to track individual service purchases
CREATE TABLE public.user_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type service_type NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_type)
);

-- Enable RLS on user_services
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Create policies for user_services
CREATE POLICY "Users can view their own services"
ON public.user_services
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
ON public.user_services
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can view all services"
ON public.user_services
FOR SELECT
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all services"
ON public.user_services
FOR UPDATE
USING (is_employee(auth.uid()));

-- Add package_type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN package_type TEXT DEFAULT 'individual';

-- Create cover_letter_responses table
CREATE TABLE public.cover_letter_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  target_position TEXT,
  target_company TEXT,
  relevant_experience TEXT,
  key_achievements TEXT,
  why_interested TEXT,
  skills_match TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cover_letter_responses
ALTER TABLE public.cover_letter_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for cover_letter_responses
CREATE POLICY "Users can view their own cover letter responses"
ON public.cover_letter_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letter responses"
ON public.cover_letter_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letter responses"
ON public.cover_letter_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all cover letter responses"
ON public.cover_letter_responses
FOR SELECT
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all cover letter responses"
ON public.cover_letter_responses
FOR UPDATE
USING (is_employee(auth.uid()));

-- Create visa_motivation_responses table
CREATE TABLE public.visa_motivation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  intended_program TEXT,
  university_name TEXT,
  program_duration TEXT,
  academic_background TEXT,
  language_proficiency TEXT,
  financial_proof TEXT,
  accommodation_plans TEXT,
  motivation_reasons TEXT,
  future_plans_germany TEXT,
  additional_documents TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on visa_motivation_responses
ALTER TABLE public.visa_motivation_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for visa_motivation_responses
CREATE POLICY "Users can view their own visa motivation responses"
ON public.visa_motivation_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visa motivation responses"
ON public.visa_motivation_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visa motivation responses"
ON public.visa_motivation_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all visa motivation responses"
ON public.visa_motivation_responses
FOR SELECT
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all visa motivation responses"
ON public.visa_motivation_responses
FOR UPDATE
USING (is_employee(auth.uid()));

-- Create university_shortlisting_responses table
CREATE TABLE public.university_shortlisting_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  academic_background TEXT,
  preferred_field TEXT,
  budget_range TEXT,
  location_preference TEXT,
  language_requirements TEXT,
  specific_requirements TEXT,
  gpa_score TEXT,
  test_scores TEXT,
  work_experience TEXT,
  research_interests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on university_shortlisting_responses
ALTER TABLE public.university_shortlisting_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for university_shortlisting_responses
CREATE POLICY "Users can view their own university shortlisting responses"
ON public.university_shortlisting_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own university shortlisting responses"
ON public.university_shortlisting_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own university shortlisting responses"
ON public.university_shortlisting_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all university shortlisting responses"
ON public.university_shortlisting_responses
FOR SELECT
USING (is_employee(auth.uid()));

CREATE POLICY "Employees can update all university shortlisting responses"
ON public.university_shortlisting_responses
FOR UPDATE
USING (is_employee(auth.uid()));

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_services_updated_at
BEFORE UPDATE ON public.user_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cover_letter_responses_updated_at
BEFORE UPDATE ON public.cover_letter_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visa_motivation_responses_updated_at
BEFORE UPDATE ON public.visa_motivation_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_university_shortlisting_responses_updated_at
BEFORE UPDATE ON public.university_shortlisting_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
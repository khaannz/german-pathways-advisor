-- Fixed Database Setup for German Pathways Advisor
-- This version removes the problematic auth.users insertion

-- Create application_status enum type
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('not_applied', 'in_progress', 'applied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  target_program TEXT,
  target_university TEXT,
  consultation_status TEXT DEFAULT 'inquiry',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'employee', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shortlisted_universities table
CREATE TABLE IF NOT EXISTS public.shortlisted_universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  application_status application_status NOT NULL DEFAULT 'not_applied',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sops table
CREATE TABLE IF NOT EXISTS public.sops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  google_docs_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lors table
CREATE TABLE IF NOT EXISTS public.lors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  google_docs_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table with optional Google Drive links
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SOP', 'LOR', 'CV', 'transcript', 'other')),
  title TEXT NOT NULL,
  file_url TEXT, -- Deprecated, kept for backward compatibility
  file_path TEXT, -- New secure file path
  drive_link TEXT, -- Optional Google Drive link
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT documents_file_or_link_required CHECK (file_path IS NOT NULL OR drive_link IS NOT NULL)
);

-- Create enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sop_responses table
CREATE TABLE IF NOT EXISTS public.sop_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  date_of_birth TEXT,
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
  research_interests TEXT,
  language_proficiency TEXT,
  financial_planning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lor_responses table
CREATE TABLE IF NOT EXISTS public.lor_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommender_name TEXT,
  recommender_designation TEXT,
  recommender_institution TEXT,
  recommender_email TEXT,
  recommender_phone TEXT,
  relationship_type TEXT,
  relationship_duration TEXT,
  courses_projects TEXT,
  key_strengths TEXT,
  specific_examples TEXT,
  grades_performance TEXT,
  research_experience TEXT,
  leadership_roles TEXT,
  communication_skills TEXT,
  recommendation_strength TEXT CHECK (recommendation_strength IN ('strong', 'moderate', 'weak')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_responses table
CREATE TABLE IF NOT EXISTS public.cv_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
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

-- Create cv_education_entries table
CREATE TABLE IF NOT EXISTS public.cv_education_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_response_id UUID NOT NULL REFERENCES public.cv_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  program TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  gpa TEXT,
  achievements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_work_experience_entries table
CREATE TABLE IF NOT EXISTS public.cv_work_experience_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_response_id UUID NOT NULL REFERENCES public.cv_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  technologies TEXT,
  achievements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create is_employee function for role checking
CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'employee'
      AND user_id IS NOT NULL
  )
$$;

-- Create handle_new_user function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', COALESCE(NEW.raw_user_meta_data ->> 'role', 'user'));
  RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlisted_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_education_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_work_experience_entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON public.profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_shortlisted_universities_user_id ON public.shortlisted_universities(user_id);
CREATE INDEX IF NOT EXISTS idx_sops_user_id ON public.sops(user_id);
CREATE INDEX IF NOT EXISTS idx_lors_user_id ON public.lors(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_user_id_type ON public.documents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id_status ON public.enquiries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sop_responses_user_id ON public.sop_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_lor_responses_user_id ON public.lor_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_responses_user_id ON public.cv_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_entries_user_id ON public.cv_education_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_work_experience_entries_user_id ON public.cv_work_experience_entries(user_id);

-- RLS POLICIES

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all profiles" ON public.profiles;
CREATE POLICY "Employees can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all profiles" ON public.profiles;
CREATE POLICY "Employees can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Shortlisted universities policies
DROP POLICY IF EXISTS "Users and employees can view shortlisted universities" ON public.shortlisted_universities;
CREATE POLICY "Users and employees can view shortlisted universities" 
ON public.shortlisted_universities 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can insert shortlisted universities" ON public.shortlisted_universities;
CREATE POLICY "Users and employees can insert shortlisted universities" 
ON public.shortlisted_universities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can update shortlisted universities" ON public.shortlisted_universities;
CREATE POLICY "Users and employees can update shortlisted universities" 
ON public.shortlisted_universities 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can delete shortlisted universities" ON public.shortlisted_universities;
CREATE POLICY "Users and employees can delete shortlisted universities" 
ON public.shortlisted_universities 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- SOPs policies
DROP POLICY IF EXISTS "Users and employees can view SOPs" ON public.sops;
CREATE POLICY "Users and employees can view SOPs" 
ON public.sops 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can insert SOPs" ON public.sops;
CREATE POLICY "Users and employees can insert SOPs" 
ON public.sops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can update SOPs" ON public.sops;
CREATE POLICY "Users and employees can update SOPs" 
ON public.sops 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can delete SOPs" ON public.sops;
CREATE POLICY "Users and employees can delete SOPs" 
ON public.sops 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- LORs policies
DROP POLICY IF EXISTS "Users and employees can view LORs" ON public.lors;
CREATE POLICY "Users and employees can view LORs" 
ON public.lors 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can insert LORs" ON public.lors;
CREATE POLICY "Users and employees can insert LORs" 
ON public.lors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can update LORs" ON public.lors;
CREATE POLICY "Users and employees can update LORs" 
ON public.lors 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can delete LORs" ON public.lors;
CREATE POLICY "Users and employees can delete LORs" 
ON public.lors 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Documents policies
DROP POLICY IF EXISTS "Students can view their own documents" ON public.documents;
CREATE POLICY "Students can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can create their own documents" ON public.documents;
CREATE POLICY "Students can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own documents" ON public.documents;
CREATE POLICY "Students can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can delete their own documents" ON public.documents;
CREATE POLICY "Students can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all documents" ON public.documents;
CREATE POLICY "Employees can view all documents" 
ON public.documents 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all documents" ON public.documents;
CREATE POLICY "Employees can update all documents" 
ON public.documents 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Enquiries policies
DROP POLICY IF EXISTS "Users can view their own enquiries" ON public.enquiries;
CREATE POLICY "Users can view their own enquiries" 
ON public.enquiries 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own enquiries" ON public.enquiries;
CREATE POLICY "Users can create their own enquiries" 
ON public.enquiries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own enquiries" ON public.enquiries;
CREATE POLICY "Users can update their own enquiries" 
ON public.enquiries 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all enquiries" ON public.enquiries;
CREATE POLICY "Employees can view all enquiries" 
ON public.enquiries 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all enquiries" ON public.enquiries;
CREATE POLICY "Employees can update all enquiries" 
ON public.enquiries 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Questionnaire response policies (SOP)
DROP POLICY IF EXISTS "Users can view their own SOP responses" ON public.sop_responses;
CREATE POLICY "Users can view their own SOP responses" 
ON public.sop_responses 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own SOP responses" ON public.sop_responses;
CREATE POLICY "Users can insert their own SOP responses" 
ON public.sop_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own SOP responses" ON public.sop_responses;
CREATE POLICY "Users can update their own SOP responses" 
ON public.sop_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all SOP responses" ON public.sop_responses;
CREATE POLICY "Employees can view all SOP responses" 
ON public.sop_responses 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all SOP responses" ON public.sop_responses;
CREATE POLICY "Employees can update all SOP responses" 
ON public.sop_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Questionnaire response policies (LOR)
DROP POLICY IF EXISTS "Users can view their own LOR responses" ON public.lor_responses;
CREATE POLICY "Users can view their own LOR responses" 
ON public.lor_responses 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own LOR responses" ON public.lor_responses;
CREATE POLICY "Users can insert their own LOR responses" 
ON public.lor_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own LOR responses" ON public.lor_responses;
CREATE POLICY "Users can update their own LOR responses" 
ON public.lor_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all LOR responses" ON public.lor_responses;
CREATE POLICY "Employees can view all LOR responses" 
ON public.lor_responses 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all LOR responses" ON public.lor_responses;
CREATE POLICY "Employees can update all LOR responses" 
ON public.lor_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Questionnaire response policies (CV)
DROP POLICY IF EXISTS "Users can view their own CV responses" ON public.cv_responses;
CREATE POLICY "Users can view their own CV responses" 
ON public.cv_responses 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own CV responses" ON public.cv_responses;
CREATE POLICY "Users can insert their own CV responses" 
ON public.cv_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CV responses" ON public.cv_responses;
CREATE POLICY "Users can update their own CV responses" 
ON public.cv_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all CV responses" ON public.cv_responses;
CREATE POLICY "Employees can view all CV responses" 
ON public.cv_responses 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all CV responses" ON public.cv_responses;
CREATE POLICY "Employees can update all CV responses" 
ON public.cv_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- CV education entries policies
DROP POLICY IF EXISTS "Users can view their own education entries" ON public.cv_education_entries;
CREATE POLICY "Users can view their own education entries" 
ON public.cv_education_entries 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own education entries" ON public.cv_education_entries;
CREATE POLICY "Users can insert their own education entries" 
ON public.cv_education_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own education entries" ON public.cv_education_entries;
CREATE POLICY "Users can update their own education entries" 
ON public.cv_education_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own education entries" ON public.cv_education_entries;
CREATE POLICY "Users can delete their own education entries" 
ON public.cv_education_entries 
FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all education entries" ON public.cv_education_entries;
CREATE POLICY "Employees can view all education entries" 
ON public.cv_education_entries 
FOR SELECT 
USING (public.is_employee(auth.uid()));

-- CV work experience entries policies
DROP POLICY IF EXISTS "Users can view their own work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Users can view their own work experience entries" 
ON public.cv_work_experience_entries 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Users can insert their own work experience entries" 
ON public.cv_work_experience_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Users can update their own work experience entries" 
ON public.cv_work_experience_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Users can delete their own work experience entries" 
ON public.cv_work_experience_entries 
FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employees can view all work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Employees can view all work experience entries" 
ON public.cv_work_experience_entries 
FOR SELECT 
USING (public.is_employee(auth.uid()));

-- STORAGE SETUP

-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create cv_photos storage bucket for professional photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cv_photos', 'cv_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "Students can upload documents" ON storage.objects;
CREATE POLICY "Students can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students can view their own documents" ON storage.objects;
CREATE POLICY "Students can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students can delete their own documents" ON storage.objects;
CREATE POLICY "Students can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Employees can view all documents" ON storage.objects;
CREATE POLICY "Employees can view all documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND public.is_employee(auth.uid()));

-- Storage policies for cv_photos bucket
DROP POLICY IF EXISTS "Users can upload CV photos" ON storage.objects;
CREATE POLICY "Users can upload CV photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view CV photos" ON storage.objects;
CREATE POLICY "Users can view CV photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete CV photos" ON storage.objects;
CREATE POLICY "Users can delete CV photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cv_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Employees can view all CV photos" ON storage.objects;
CREATE POLICY "Employees can view all CV photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv_photos' AND public.is_employee(auth.uid()));

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE public.documents IS 'Document uploads with optional Google Drive integration';
COMMENT ON FUNCTION public.is_employee IS 'Security function to check if user has employee role';

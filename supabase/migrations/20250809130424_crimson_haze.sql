/*
  # Fix Employee Access Policies

  1. Security Updates
    - Fix RLS policies for employee access
    - Add proper validation for employee role checks
    - Ensure data integrity and security

  2. Performance Improvements
    - Add missing indexes for better query performance
    - Optimize employee role checking function

  3. Data Consistency
    - Add constraints for data validation
    - Ensure proper foreign key relationships
*/

-- Improve the is_employee function for better performance and security
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

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON public.profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_documents_user_id_type ON public.documents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id_status ON public.enquiries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_shortlisted_universities_user_id ON public.shortlisted_universities(user_id);
CREATE INDEX IF NOT EXISTS idx_sops_user_id ON public.sops(user_id);
CREATE INDEX IF NOT EXISTS idx_lors_user_id ON public.lors(user_id);

-- Add constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'employee', 'admin'));

ALTER TABLE public.enquiries 
ADD CONSTRAINT check_subject_length CHECK (char_length(trim(subject)) >= 5),
ADD CONSTRAINT check_message_length CHECK (char_length(trim(message)) >= 10);

ALTER TABLE public.documents 
ADD CONSTRAINT check_title_length CHECK (char_length(trim(title)) >= 1);

-- Ensure proper foreign key relationships exist
DO $$
BEGIN
  -- Add foreign key constraint for profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key constraints for other tables
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'shortlisted_universities_user_id_fkey' 
    AND table_name = 'shortlisted_universities'
  ) THEN
    ALTER TABLE public.shortlisted_universities 
    ADD CONSTRAINT shortlisted_universities_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_user_id_fkey' 
    AND table_name = 'documents'
  ) THEN
    ALTER TABLE public.documents 
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'enquiries_user_id_fkey' 
    AND table_name = 'enquiries'
  ) THEN
    ALTER TABLE public.enquiries 
    ADD CONSTRAINT enquiries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sops_user_id_fkey' 
    AND table_name = 'sops'
  ) THEN
    ALTER TABLE public.sops 
    ADD CONSTRAINT sops_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lors_user_id_fkey' 
    AND table_name = 'lors'
  ) THEN
    ALTER TABLE public.lors 
    ADD CONSTRAINT lors_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sop_responses_user_id_fkey' 
    AND table_name = 'sop_responses'
  ) THEN
    ALTER TABLE public.sop_responses 
    ADD CONSTRAINT sop_responses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lor_responses_user_id_fkey' 
    AND table_name = 'lor_responses'
  ) THEN
    ALTER TABLE public.lor_responses 
    ADD CONSTRAINT lor_responses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cv_responses_user_id_fkey' 
    AND table_name = 'cv_responses'
  ) THEN
    ALTER TABLE public.cv_responses 
    ADD CONSTRAINT cv_responses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cv_education_entries_user_id_fkey' 
    AND table_name = 'cv_education_entries'
  ) THEN
    ALTER TABLE public.cv_education_entries 
    ADD CONSTRAINT cv_education_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cv_work_experience_entries_user_id_fkey' 
    AND table_name = 'cv_work_experience_entries'
  ) THEN
    ALTER TABLE public.cv_work_experience_entries 
    ADD CONSTRAINT cv_work_experience_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update employee policies to be more secure and consistent
-- Documents table policies
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

-- Enquiries table policies
DROP POLICY IF EXISTS "Employees can update all enquiries" ON public.enquiries;
CREATE POLICY "Employees can update all enquiries" 
ON public.enquiries 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Add employee policies for questionnaire responses
DROP POLICY IF EXISTS "Employees can update all SOP responses" ON public.sop_responses;
CREATE POLICY "Employees can update all SOP responses" 
ON public.sop_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all LOR responses" ON public.lor_responses;
CREATE POLICY "Employees can update all LOR responses" 
ON public.lor_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can update all CV responses" ON public.cv_responses;
CREATE POLICY "Employees can update all CV responses" 
ON public.cv_responses 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Add employee policies for CV entries
DROP POLICY IF EXISTS "Employees can view all education entries" ON public.cv_education_entries;
CREATE POLICY "Employees can view all education entries" 
ON public.cv_education_entries 
FOR SELECT 
USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Employees can view all work experience entries" ON public.cv_work_experience_entries;
CREATE POLICY "Employees can view all work experience entries" 
ON public.cv_work_experience_entries 
FOR SELECT 
USING (public.is_employee(auth.uid()));

-- Add employee policies for managing user data
DROP POLICY IF EXISTS "Employees can update all profiles" ON public.profiles;
CREATE POLICY "Employees can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_employee(auth.uid()));

-- Add validation function for URLs
CREATE OR REPLACE FUNCTION public.is_valid_url(url_text TEXT)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Basic URL validation
  IF url_text IS NULL OR url_text = '' THEN
    RETURN false;
  END IF;
  
  -- Check if it starts with http:// or https://
  IF url_text !~ '^https?://' THEN
    RETURN false;
  END IF;
  
  -- Check if it contains a domain
  IF url_text !~ '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add URL validation constraints
ALTER TABLE public.sops 
ADD CONSTRAINT check_google_docs_link_valid 
CHECK (public.is_valid_url(google_docs_link));

ALTER TABLE public.lors 
ADD CONSTRAINT check_google_docs_link_valid 
CHECK (public.is_valid_url(google_docs_link));

-- Add constraint for drive links in documents
ALTER TABLE public.documents 
ADD CONSTRAINT check_drive_link_valid 
CHECK (drive_link IS NULL OR public.is_valid_url(drive_link));

-- Add constraint for LinkedIn URLs in SOP responses
ALTER TABLE public.sop_responses 
ADD CONSTRAINT check_linkedin_url_valid 
CHECK (linked_in IS NULL OR linked_in = '' OR public.is_valid_url(linked_in));
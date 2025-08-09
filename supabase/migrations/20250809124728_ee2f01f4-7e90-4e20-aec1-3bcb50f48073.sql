-- Add missing columns to match enhanced forms
ALTER TABLE public.cv_responses
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE public.cv_education_entries
  ADD COLUMN IF NOT EXISTS gpa TEXT,
  ADD COLUMN IF NOT EXISTS achievements TEXT;

ALTER TABLE public.cv_work_experience_entries
  ADD COLUMN IF NOT EXISTS technologies TEXT,
  ADD COLUMN IF NOT EXISTS achievements TEXT;

ALTER TABLE public.lor_responses
  ADD COLUMN IF NOT EXISTS recommender_phone TEXT,
  ADD COLUMN IF NOT EXISTS research_experience TEXT,
  ADD COLUMN IF NOT EXISTS leadership_roles TEXT,
  ADD COLUMN IF NOT EXISTS communication_skills TEXT,
  ADD COLUMN IF NOT EXISTS recommendation_strength TEXT;

ALTER TABLE public.sop_responses
  ADD COLUMN IF NOT EXISTS research_interests TEXT,
  ADD COLUMN IF NOT EXISTS language_proficiency TEXT,
  ADD COLUMN IF NOT EXISTS financial_planning TEXT;

-- Documents: store the storage path used for secure downloads
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Storage policies for private documents bucket
-- Allow users to manage their own files in 'documents' bucket (folder = their user_id)
CREATE POLICY IF NOT EXISTS "Users can upload their own documents"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own documents"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own documents"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own documents"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Employees can view all documents
CREATE POLICY IF NOT EXISTS "Employees can view all documents"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND public.is_employee(auth.uid())
);

-- Optionally make cv_photos publicly readable to keep current UI working
UPDATE storage.buckets SET public = TRUE WHERE id = 'cv_photos';
ALTER TABLE public.lor_responses
ADD COLUMN IF NOT EXISTS recommenders jsonb;

UPDATE public.lor_responses
SET recommenders = jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
  'name', recommender_name,
  'designation', recommender_designation,
  'institution', recommender_institution,
  'email', recommender_email,
  'phone', recommender_phone,
  'relationship_type', relationship_type,
  'relationship_duration', relationship_duration,
  'courses_projects', courses_projects,
  'key_strengths', key_strengths,
  'specific_examples', specific_examples,
  'grades_performance', grades_performance,
  'research_experience', research_experience,
  'leadership_roles', leadership_roles,
  'communication_skills', communication_skills,
  'recommendation_strength', recommendation_strength
)))
WHERE recommenders IS NULL
  AND recommender_name IS NOT NULL;

COMMENT ON COLUMN public.lor_responses.recommenders IS 'Collection of recommender entries stored as JSON array';
ALTER TABLE public.lor_responses
ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

UPDATE public.lor_responses
SET submitted_at = created_at
WHERE submitted_at IS NULL
  AND recommender_name IS NOT NULL;

ALTER TABLE public.sop_responses
ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

UPDATE public.sop_responses
SET submitted_at = created_at
WHERE submitted_at IS NULL
  AND full_name IS NOT NULL;

ALTER TABLE public.cv_responses
ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

UPDATE public.cv_responses
SET submitted_at = created_at
WHERE submitted_at IS NULL
  AND (
    summary IS NOT NULL OR
    technical_skills IS NOT NULL OR
    soft_skills IS NOT NULL OR
    languages IS NOT NULL OR
    certifications IS NOT NULL OR
    extracurriculars IS NOT NULL
  );

COMMENT ON COLUMN public.lor_responses.submitted_at IS 'Timestamp when the user finalized the LOR questionnaire';
COMMENT ON COLUMN public.sop_responses.submitted_at IS 'Timestamp when the user finalized the SOP questionnaire';
COMMENT ON COLUMN public.cv_responses.submitted_at IS 'Timestamp when the user finalized the CV questionnaire';

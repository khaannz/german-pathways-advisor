-- Add enhanced fields to cv_responses table
ALTER TABLE public.cv_responses 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS gpa TEXT,
ADD COLUMN IF NOT EXISTS achievements TEXT;

-- Add enhanced fields to cv_education_entries table
ALTER TABLE public.cv_education_entries 
ADD COLUMN IF NOT EXISTS gpa TEXT,
ADD COLUMN IF NOT EXISTS achievements TEXT;

-- Add enhanced fields to cv_work_experience_entries table
ALTER TABLE public.cv_work_experience_entries 
ADD COLUMN IF NOT EXISTS technologies TEXT,
ADD COLUMN IF NOT EXISTS achievements TEXT;

-- Add enhanced fields to lor_responses table
ALTER TABLE public.lor_responses 
ADD COLUMN IF NOT EXISTS recommender_phone TEXT,
ADD COLUMN IF NOT EXISTS research_experience TEXT,
ADD COLUMN IF NOT EXISTS leadership_roles TEXT,
ADD COLUMN IF NOT EXISTS communication_skills TEXT,
ADD COLUMN IF NOT EXISTS recommendation_strength TEXT CHECK (recommendation_strength IN ('strong', 'moderate', 'weak'));

-- Add enhanced fields to sop_responses table
ALTER TABLE public.sop_responses 
ADD COLUMN IF NOT EXISTS research_interests TEXT,
ADD COLUMN IF NOT EXISTS language_proficiency TEXT,
ADD COLUMN IF NOT EXISTS financial_planning TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_responses_user_id ON public.cv_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_lor_responses_user_id ON public.lor_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_sop_responses_user_id ON public.sop_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_entries_user_id ON public.cv_education_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_work_experience_entries_user_id ON public.cv_work_experience_entries(user_id);

-- Add comments for documentation
COMMENT ON COLUMN public.cv_responses.summary IS 'Professional summary for CV';
COMMENT ON COLUMN public.cv_responses.gpa IS 'Overall GPA';
COMMENT ON COLUMN public.cv_responses.achievements IS 'Key achievements';
COMMENT ON COLUMN public.cv_education_entries.gpa IS 'GPA for this education entry';
COMMENT ON COLUMN public.cv_education_entries.achievements IS 'Achievements for this education entry';
COMMENT ON COLUMN public.cv_work_experience_entries.technologies IS 'Technologies used in this role';
COMMENT ON COLUMN public.cv_work_experience_entries.achievements IS 'Achievements in this role';
COMMENT ON COLUMN public.lor_responses.recommender_phone IS 'Phone number of recommender';
COMMENT ON COLUMN public.lor_responses.research_experience IS 'Research experience details';
COMMENT ON COLUMN public.lor_responses.leadership_roles IS 'Leadership roles and responsibilities';
COMMENT ON COLUMN public.lor_responses.communication_skills IS 'Communication skills assessment';
COMMENT ON COLUMN public.lor_responses.recommendation_strength IS 'Strength of recommendation (strong/moderate/weak)';
COMMENT ON COLUMN public.sop_responses.research_interests IS 'Research interests and focus areas';
COMMENT ON COLUMN public.sop_responses.language_proficiency IS 'Language proficiency details';
COMMENT ON COLUMN public.sop_responses.financial_planning IS 'Financial planning for studies'; 